exports.up = function (knex) {
  return knex.schema.createTable('patients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('date_of_birth');
    table.string('blood_type');
    table.text('medical_history');
    table.string('emergency_contact');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('patients');
};