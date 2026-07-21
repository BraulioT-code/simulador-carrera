-- ============================================================================
--  Simulador de Carrera — Leaderboard global
--
--  Pegar este archivo completo en el SQL Editor de Supabase y ejecutarlo.
--  Es idempotente: se puede volver a correr sin borrar los datos existentes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tabla de carreras publicadas
-- ---------------------------------------------------------------------------
-- Nota: "position" y "number" son palabras reservadas en Postgres, por eso van
-- siempre entre comillas dobles.
create table if not exists public.careers (
  id           uuid primary key default gen_random_uuid(),
  alias        text not null check (char_length(btrim(alias)) between 2 and 18),
  player_name  text not null check (char_length(player_name) between 1 and 14),
  nationality  text not null,
  "position"   text not null,
  "number"     int  not null check ("number" between 1 and 99),
  club         text not null,
  league       text not null,

  score        int  not null check (score between 0 and 100),
  title        text not null,
  peak_ovr     int  not null check (peak_ovr between 40 and 99),
  pj           int  not null check (pj >= 0),
  gls          int  not null check (gls >= 0),
  ast          int  not null check (ast >= 0),
  int_caps     int  not null default 0 check (int_caps >= 0),
  earnings     numeric(8,1) not null default 0 check (earnings >= 0),

  trophies     jsonb not null default '[]'::jsonb,
  seasons      jsonb not null,

  created_at   timestamptz not null default now()
);

create index if not exists careers_ranking_idx
  on public.careers (score desc, created_at asc);

create index if not exists careers_alias_idx
  on public.careers (alias, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security:
--   · cualquiera puede LEER el ranking
--   · nadie puede INSERTAR directamente; solo a través de submit_career()
-- ---------------------------------------------------------------------------
alter table public.careers enable row level security;

drop policy if exists "leaderboard lectura pública" on public.careers;
create policy "leaderboard lectura pública"
  on public.careers for select
  using (true);

-- (sin políticas de insert/update/delete: quedan bloqueadas para anon)

-- ---------------------------------------------------------------------------
-- Cálculo del puntaje de leyenda EN EL SERVIDOR
-- Debe reflejar src/utils/legend.js
-- ---------------------------------------------------------------------------
create or replace function public.legend_score(p_seasons jsonb, p_position text, p_int_caps int)
returns int
language plpgsql
immutable
as $$
declare
  s              jsonb;  -- temporada
  t              jsonb;  -- trofeo
  v_trophy_pts   numeric := 0;
  v_peak         int     := 0;
  v_pj           int     := 0;
  v_gls          int     := 0;
  v_ast          int     := 0;
  v_vi           int     := 0;
  v_peak_pts     numeric;
  v_prod_pts     numeric;
  v_long_pts     numeric;
  v_caps_pts     numeric;
begin
  for s in select * from jsonb_array_elements(p_seasons) loop
    v_peak := greatest(v_peak, coalesce((s->>'ovr')::int, 0));
    v_pj   := v_pj  + coalesce((s->>'pj')::int, 0);
    v_gls  := v_gls + coalesce((s->>'gls')::int, 0);
    v_ast  := v_ast + coalesce((s->>'ast')::int, 0);
    v_vi   := v_vi  + coalesce((s->>'vi')::int, 0);

    for t in select * from jsonb_array_elements(coalesce(s->'trophies', '[]'::jsonb)) loop
      v_trophy_pts := v_trophy_pts + case t->>'t'
        when 'mundial'     then 18
        when 'ballon'      then 14
        when 'continental' then 8
        when 'bota'        then 7
        when 'mvp'         then 5
        when 'liga'        then 4
        when 'eoty'        then 3
        when 'copa'        then 2.5
        else 2
      end;
    end loop;
  end loop;

  v_trophy_pts := least(v_trophy_pts, 42);
  v_peak_pts   := least(greatest(((v_peak - 60)::numeric / 39) * 24, 0), 24);

  if p_position = 'GK' then
    v_prod_pts := least(greatest((v_vi::numeric / greatest(v_pj, 1)) * 45, 0), 16);
  else
    v_prod_pts := least(greatest(((v_gls + 0.6 * v_ast) / greatest(v_pj, 1)) * 40, 0), 16);
  end if;

  v_long_pts := least(greatest((v_pj::numeric / 900) * 10, 0), 10);
  v_caps_pts := least(greatest((coalesce(p_int_caps, 0)::numeric / 60) * 8, 0), 8);

  return greatest(0, least(100,
    round(v_trophy_pts + v_peak_pts + v_prod_pts + v_long_pts + v_caps_pts)::int
  ));
end;
$$;

-- ---------------------------------------------------------------------------
-- Publicar una carrera.
-- Valida coherencia, recalcula el puntaje y devuelve la fila insertada.
-- ---------------------------------------------------------------------------
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
    -- No se puede marcar/asistir más de lo humanamente posible
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

  -- Las edades no se pueden repetir
  -- (el alias se llama "e" para no chocar con la variable "s" de arriba)
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
    score, title, peak_ovr, pj, gls, ast, int_caps, earnings, trophies, seasons
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
    coalesce(payload->'trophies', '[]'::jsonb),
    v_seasons
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- Permitir que el rol anónimo llame a la función (pero no inserte directo)
grant execute on function public.submit_career(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- El ranking se consulta directamente sobre la tabla (la política de SELECT
-- de arriba lo permite). El cliente pide solo las columnas que necesita, sin
-- traer el detalle pesado de temporadas:
--
--   supabase.from("careers")
--     .select("id, alias, player_name, nationality, position, number, club,
--              league, score, title, peak_ovr, pj, gls, ast, int_caps,
--              earnings, trophies, created_at")
--     .order("score", { ascending: false })
--     .order("created_at", { ascending: true })
--     .limit(50)
--
-- Y el detalle completo de una carrera:
--
--   supabase.from("careers").select("*").eq("id", id).single()
-- ---------------------------------------------------------------------------
