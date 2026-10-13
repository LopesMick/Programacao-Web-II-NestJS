-- AlterTable
ALTER TABLE `alunos` ADD COLUMN `curso_id` INTEGER NULL;

-- CreateTable
-- Collation igual à das tabelas existentes, para comparar alunos.curso com cursos.nome
CREATE TABLE `cursos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `cursos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Migração de dados: cada valor distinto de alunos.curso vira um registro em cursos
INSERT INTO `cursos` (`nome`)
SELECT DISTINCT TRIM(`curso`)
FROM `alunos`
WHERE TRIM(`curso`) <> ''
ORDER BY TRIM(`curso`);

-- Liga cada aluno ao curso correspondente pelo nome
UPDATE `alunos` a
JOIN `cursos` c ON c.`nome` = TRIM(a.`curso`)
SET a.`curso_id` = c.`id`;

-- CreateIndex
CREATE INDEX `alunos_curso_id_idx` ON `alunos`(`curso_id`);

-- AddForeignKey
ALTER TABLE `alunos` ADD CONSTRAINT `alunos_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `cursos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
