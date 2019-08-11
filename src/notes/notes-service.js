const notesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  }
};

module.exports = notesService;
