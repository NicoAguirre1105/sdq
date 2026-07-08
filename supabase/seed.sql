-- SD Quito — datos de ejemplo
-- Todo el contenido es INVENTADO para poder maquetar las páginas del entregable 1.
-- Correr después de schema.sql. El usuario reemplaza esto por datos reales más adelante.

-- ============ Fútbol: temporada, competencia, equipos, partidos ============

insert into seasons (id, label, is_current) values
  ('a0000000-0000-0000-0000-000000000001', '2026', true);

insert into competitions (id, season_id, name, slug) values
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Serie B 2026', 'serie-b-2026');

insert into stages (id, competition_id, name, slug, format, order_index) values
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Fase 1', 'fase-1', 'liga', 1);

insert into teams (id, name, short_name, is_own_team) values
  ('a0000000-0000-0000-0000-000000000010', 'Sociedad Deportivo Quito', 'Quito', true),
  ('a0000000-0000-0000-0000-000000000011', 'Aucas', 'Aucas', false),
  ('a0000000-0000-0000-0000-000000000012', 'Macará', 'Macará', false),
  ('a0000000-0000-0000-0000-000000000013', 'Mushuc Runa', 'M. Runa', false),
  ('a0000000-0000-0000-0000-000000000014', 'Gualaceo SC', 'Gualaceo', false),
  ('a0000000-0000-0000-0000-000000000015', 'Cumbayá FC', 'Cumbayá', false);

insert into stage_teams (stage_id, team_id)
select 'a0000000-0000-0000-0000-000000000003', id from teams
where id in (
  'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000011',
  'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000013',
  'a0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000015'
);

-- partidos jugados (fechas 1-3) para poblar la tabla de posiciones
insert into matches (stage_id, matchday, home_team_id, away_team_id, match_date, score_home, score_away, status) values
  ('a0000000-0000-0000-0000-000000000003', 1, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000012', '2026-06-14 15:30-05', 2, 1, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 1, 'a0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000014', '2026-06-14 18:00-05', 0, 0, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 1, 'a0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000011', '2026-06-15 15:30-05', 1, 3, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000014', '2026-06-21 15:30-05', 3, 0, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'a0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000013', '2026-06-21 18:00-05', 1, 1, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000015', '2026-06-22 15:30-05', 2, 2, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 3, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000015', '2026-06-28 15:30-05', 1, 0, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 3, 'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000013', '2026-06-28 18:00-05', 0, 1, 'jugado'),
  ('a0000000-0000-0000-0000-000000000003', 3, 'a0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000011', '2026-06-29 15:30-05', 2, 2, 'jugado');

-- próximo partido (fecha 4) — el que se muestra en el hero de Home
insert into matches (stage_id, matchday, home_team_id, away_team_id, match_date, status) values
  ('a0000000-0000-0000-0000-000000000003', 4, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000011', '2026-07-11 15:30-05', 'programado'),
  ('a0000000-0000-0000-0000-000000000003', 4, 'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000014', '2026-07-12 15:30-05', 'programado'),
  ('a0000000-0000-0000-0000-000000000003', 4, 'a0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000015', '2026-07-12 18:00-05', 'programado');

-- ============ Segunda competición (liga) — reusa 4 equipos existentes ============
-- Misma temporada 2026. Demuestra el selector de torneo en /futbol.

insert into competitions (id, season_id, name, slug) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Copa Pichincha 2026', 'copa-pichincha-2026');

insert into stages (id, competition_id, name, slug, format, order_index) values
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Fase única', 'fase-unica', 'liga', 1);

-- Quito, Aucas, Macará, Mushuc Runa
insert into stage_teams (stage_id, team_id) values
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000011'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000012'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000013');

-- round-robin simple (fechas 1-3, 2 partidos por fecha) para poblar la tabla
insert into matches (stage_id, matchday, home_team_id, away_team_id, match_date, score_home, score_away, status) values
  ('b0000000-0000-0000-0000-000000000002', 1, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000011', '2026-06-14 15:30-05', 2, 0, 'jugado'),
  ('b0000000-0000-0000-0000-000000000002', 1, 'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000013', '2026-06-14 18:00-05', 1, 1, 'jugado'),
  ('b0000000-0000-0000-0000-000000000002', 2, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000012', '2026-06-21 15:30-05', 3, 1, 'jugado'),
  ('b0000000-0000-0000-0000-000000000002', 2, 'a0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000013', '2026-06-21 18:00-05', 0, 2, 'jugado'),
  ('b0000000-0000-0000-0000-000000000002', 3, 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000013', '2026-06-28 15:30-05', 1, 0, 'jugado'),
  ('b0000000-0000-0000-0000-000000000002', 3, 'a0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000012', '2026-06-28 18:00-05', 2, 2, 'jugado');

-- próximos partidos (fecha 4) de esta competición
insert into matches (stage_id, matchday, home_team_id, away_team_id, match_date, status) values
  ('b0000000-0000-0000-0000-000000000002', 4, 'a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000010', '2026-07-13 15:30-05', 'programado'),
  ('b0000000-0000-0000-0000-000000000002', 4, 'a0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000011', '2026-07-13 18:00-05', 'programado');

-- ============ Partidos con fecha sin confirmar (match_date null) ============
-- Se listan al final del calendario, en orden de ingreso (created_at). Sin matchday.
insert into matches (stage_id, home_team_id, away_team_id, status) values
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000013', 'programado'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000011', 'programado');

-- ============ Editorial: posts ============

insert into posts (title, slug, excerpt, content_md, category, published_at) values
  ('Triunfo en la altura: Quito 2-1 Macará', 'triunfo-altura-quito-2-1-macara',
   'Doblete de Bryan Angulo para un cierre agónico en el Atahualpa.',
   '## Triunfo en la altura\n\nDoblete de Bryan Angulo para un cierre agónico en el Atahualpa. El equipo mostró carácter en los últimos minutos ante un rival que llegó a igualar el marcador.',
   'cronica', now() - interval '2 days'),

  ('Refuerzo: llega el volante Iván Mera', 'refuerzo-ivan-mera',
   'El mediocampista firma por dos temporadas con la azulgrana.',
   '## Nuevo refuerzo\n\nEl mediocampista firma por dos temporadas con la azulgrana. Llega procedente del ascenso con la ilusión de aportar experiencia al mediocampo.',
   'noticia', now() - interval '3 days'),

  ('Venta de entradas: Clásico Capitalino', 'venta-entradas-clasico-capitalino',
   'Preventa para socios desde el lunes 07 de julio.',
   '## Preventa\n\nPreventa para socios desde el lunes 07 de julio. La venta general abre 48 horas después en boletería del estadio y puntos autorizados.',
   'aviso', now() - interval '4 days'),

  ('Empate sin goles ante Mushuc Runa', 'empate-mushuc-runa',
   'Un punto que sabe a poco tras dominar gran parte del partido.',
   '## Reparto de puntos\n\nUn punto que sabe a poco tras dominar gran parte del partido. El equipo generó ocasiones claras que no pudo concretar.',
   'cronica', now() - interval '9 days'),

  ('Contrato renovado: el capitán sigue una temporada más', 'renovacion-capitan',
   'El referente del plantel extendió su vínculo con el club.',
   '## Renovación\n\nEl referente del plantel extendió su vínculo con el club hasta el final de la próxima temporada.',
   'noticia', now() - interval '10 days'),

  ('Cambio de horario: Quito vs Gualaceo se juega a las 18:00', 'cambio-horario-gualaceo',
   'La fecha se reprograma por disposición del ente organizador.',
   '## Cambio de horario\n\nLa fecha se reprograma por disposición del ente organizador. Se mantiene la sede y el día, solo cambia el horario de inicio.',
   'aviso', now() - interval '12 days'),

  ('Victoria sólida ante Gualaceo en casa', 'victoria-gualaceo-casa',
   'Tres goles y una defensa que no concedió espacios.',
   '## Victoria en casa\n\nTres goles y una defensa que no concedió espacios en un partido controlado de principio a fin.',
   'cronica', now() - interval '15 days'),

  ('Nueva imagen: se presenta la camiseta alternativa', 'nueva-camiseta-alternativa',
   'La segunda equipación rinde homenaje a la hinchada histórica.',
   '## Nueva camiseta\n\nLa segunda equipación rinde homenaje a la hinchada histórica del club y ya está disponible para reserva.',
   'noticia', now() - interval '20 days');

-- ============ Plantilla ============

insert into players (full_name, position, jersey_number) values
  ('Pedro Ramírez', 'Portero', 1),
  ('Luis Cevallos', 'Portero', 12),
  ('Martín Alvarado', 'Portero', 22),
  ('Diego Quinde', 'Defensa', 2),
  ('Andrés Portilla', 'Defensa', 3),
  ('Jefferson Caicedo', 'Defensa', 4),
  ('Kevin Sarango', 'Defensa', 5),
  ('Byron Tenesaca', 'Defensa', 6),
  ('Cristian Ortega', 'Defensa', 13),
  ('Fabricio Moreta', 'Defensa', 16),
  ('Willian Balda', 'Defensa', 23),
  ('Bryan Angulo', 'Mediocampista', 8),
  ('Iván Mera', 'Mediocampista', 10),
  ('Josué Perlaza', 'Mediocampista', 14),
  ('Sebastián Gómez', 'Mediocampista', 15),
  ('Carlos Rentería', 'Mediocampista', 17),
  ('Alan Franco', 'Mediocampista', 18),
  ('Denis Caicedo', 'Mediocampista', 20),
  ('Michael Estrada', 'Delantero', 7),
  ('Jhon Espinoza', 'Delantero', 9),
  ('Cristian Martínez', 'Delantero', 11),
  ('Gabriel Cortez', 'Delantero', 19),
  ('Rodrigo Aguirre', 'Delantero', 21),
  ('Anthony Landázuri', 'Delantero', 25);
