exports.up = function (knex) {
  return knex.schema.createTable('medical_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('appointment_id').references('id').inTable('appointments').onDelete('CASCADE');
    table.text('diagnosis');
    table.text('treatment');
    table.text('notes');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('medical_records');
};