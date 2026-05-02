exports.up = function (knex) {
  return knex.schema.createTable('appointments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('patient_id').references('id').inTable('patients').onDelete('CASCADE');
    table.uuid('doctor_id').references('id').inTable('doctors').onDelete('CASCADE');
    table.timestamp('scheduled_at').notNullable();
    table.enum('status', ['pending', 'confirmed', 'completed', 'cancelled']).defaultTo('pending');
    table.string('reason');
    table.text('notes');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('appointments');
};