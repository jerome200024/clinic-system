exports.up = function (knex) {
  return knex.schema.createTable('prescriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('record_id').references('id').inTable('medical_records').onDelete('CASCADE');
    table.jsonb('medications').defaultTo('[]');
    table.string('pdf_url');
    table.timestamp('issued_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('prescriptions');
};