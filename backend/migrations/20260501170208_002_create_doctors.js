exports.up = function (knex) {
  return knex.schema.createTable('doctors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('specialization').notNullable();
    table.string('license_no').unique().notNullable();
    table.integer('consultation_fee').defaultTo(0);
    table.jsonb('available_days').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('doctors');
};