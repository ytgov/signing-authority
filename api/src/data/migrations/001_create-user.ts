import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
    return knex.schema.createTable("user", function (t) {
        t.string("email", 200).notNullable().primary();
        t.string("first_name", 100).notNullable();
        t.string("last_name", 100).notNullable();
        t.dateTime("create_date").notNullable();
        t.string("roles", 1000).nullable();
        t.string("status", 20).notNullable();
    });
};

exports.down = function (knex: knex.Knex, Promise: any) {
    return knex.schema.dropTable("user");
};
