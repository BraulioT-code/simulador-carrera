-- ============================================================================
--  Migración: agregar reputación y moral a las carreras publicadas.
--
--  Ejecutar en el SQL Editor de Supabase si YA tenías el ranking creado con la
--  versión anterior del schema. Si vas a correr schema.sql completo de nuevo,
--  no hace falta: ese archivo ya incluye estas columnas.
--  Es idempotente: se puede correr varias veces sin problema.
-- ============================================================================

-- 1) Columnas nuevas (con valores por defecto para las filas existentes)
alter table public.careers
  add column if not exists reputation int not null default 20,
  add column if not exists morale int not null default 70;

alter table public.careers
  drop constraint if exists careers_reputation_check,
  add constraint careers_reputation_check check (reputation between 0 and 100);

alter table public.careers
  drop constraint if exists careers_morale_check,
  add constraint careers_morale_check check (morale between 0 and 100);

-- 2) Actualizar la función de publicación para que guarde ambos valores
create or replace function public.submit_career(payload jsonb)
returns public.careers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alias    text := btrim(coalesce(payload->>'alias', ''));
  v_name     text := btrim(coalesce(payload->>'player_name', ''));
  v_position text := coalesce(payload->>'position', '');
  v_seasons  jsonb := coalesce(payload->'seasons', '[]'::jsonb);
  v_caps     int  := coalesce((payload->>'int_caps')::int, 0);
  v_count    int;
  s          jsonb;
  v_pj       int := 0;
  v_gls      int := 0;
  v_ast      int := 0;
  v_peak     int := 0;
  v_score    int;
  v_recent   int;
  v_row      public.careers;
begin
  -- --- Validaciones de forma -------------------------------------------------
  if char_length(v_alias) < 2 or char_length(v_alias) > 18 then
    raise exception 'El alias debe tener entre 2 y 18 caracteres';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 14 then
    raise exception 'Nombre de jugador inválido';
  end if;
  if v_position not in ('GK','CB','LB','RB','CDM','CM','LM','RM','CAM','LW','RW','ST') then
    raise exception 'Posición inválida';
  end if;

  v_count := jsonb_array_length(v_seasons);
  if v_count < 6 or v_count > 12 then
    raise exception 'Una carrera debe tener entre 6 y 12 temporadas (recibidas: %)', v_count;
  end if;

  -- --- Validaciones de contenido --------------------------------------------
  for s in select * from jsonb_array_elements(v_seasons) loop
    if (s->>'age')::int < 16 or (s->>'age')::int > 38 then
      raise exception 'Edad de temporada fuera de rango';
    end if;
    if (s->>'ovr')::int < 40 or (s->>'ovr')::int > 99 then
      raise exception 'OVR fuera de rango';
    end if;
    if (s->>'pj')::int < 0 or (s->>'pj')::int > 95 then
      raise exception 'Partidos jugados fuera de rango';
    end if;
    if (s->>'gls')::int > (s->>'pj')::int * 4
       or (s->>'ast')::int > (s->>'pj')::int * 4 then
      raise exception 'Estadísticas de temporada incoherentes';
    end if;
    if jsonb_array_length(coalesce(s->'trophies','[]'::jsonb)) > 8 then
      raise exception 'Demasiados trofeos en una temporada';
    end if;

    v_pj   := v_pj  + (s->>'pj')::int;
    v_gls  := v_gls + coalesce((s->>'gls')::int, 0);
    v_ast  := v_ast + coalesce((s->>'ast')::int, 0);
    v_peak := greatest(v_peak, (s->>'ovr')::int);
  end loop;

  if (
    select count(distinct (e.value->>'age'))
    from jsonb_array_elements(v_seasons) as e
  ) <> v_count then
    raise exception 'Hay temporadas con edades repetidas';
  end if;

  if v_caps > v_count * 30 then
    raise exception 'Partidos internacionales incoherentes';
  end if;

  -- --- Anti-abuso: máximo 10 publicaciones por alias por hora ----------------
  select count(*) into v_recent
  from public.careers
  where alias = v_alias and created_at > now() - interval '1 hour';
  if v_recent >= 10 then
    raise exception 'Demasiadas publicaciones seguidas, probá de nuevo más tarde';
  end if;

  -- --- Puntaje calculado por el servidor (se ignora el del cliente) ----------
  v_score := public.legend_score(v_seasons, v_position, v_caps);

  insert into public.careers (
    alias, player_name, nationality, "position", "number", club, league,
    score, title, peak_ovr, pj, gls, ast, int_caps, earnings,
    reputation, morale, trophies, seasons
  ) values (
    v_alias,
    v_name,
    coalesce(payload->>'nationality', '—'),
    v_position,
    coalesce((payload->>'number')::int, 10),
    coalesce(payload->>'club', '—'),
    coalesce(payload->>'league', '—'),
    v_score,
    case
      when v_score >= 88 then 'Leyenda mundial'
      when v_score >= 75 then 'Ídolo global'
      when v_score >= 62 then 'Estrella consagrada'
      when v_score >= 48 then 'Gran profesional'
      when v_score >= 34 then 'Sólido de primera'
      when v_score >= 20 then 'Ídolo de barrio'
      else 'Carrera humilde'
    end,
    v_peak,
    v_pj,
    v_gls,
    v_ast,
    v_caps,
    least(coalesce((payload->>'earnings')::numeric, 0), 9999),
    greatest(0, least(100, coalesce((payload->>'reputation')::int, 20))),
    greatest(0, least(100, coalesce((payload->>'morale')::int, 70))),
    coalesce(payload->'trophies', '[]'::jsonb),
    v_seasons
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.submit_career(jsonb) to anon, authenticated;
