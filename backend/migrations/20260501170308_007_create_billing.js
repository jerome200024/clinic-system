exports.up = function (knex) {
  return knex.schema.createTable('billing', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('appointment_id').references('id').inTable('appointments').onDelete('CASCADE');
    table.integer('amount').notNullable();
    table.enum('status', ['unpaid', 'paid', 'refunded']).defaultTo('unpaid');
    table.string('stripe_id');
    table.timestamp('paid_at');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('billing');
};