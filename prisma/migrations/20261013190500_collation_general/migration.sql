-- Deve preceder o backfill de cursos, que compara as duas tabelas por nome.
ALTER TABLE `alunos` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE `disciplinas` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
