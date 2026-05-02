exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.enum('role', ['patient', 'doctor', 'admin']).notNullable();
      table.string('phone');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};