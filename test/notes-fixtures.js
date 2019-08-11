function makeFoldersArray() {
  return [
    {
      folder_name: "Super",
      id: 1
    },
    {
      folder_name: "Important",
      id: 2
    },
    {
      folder_name: "Spangley",
      id: 3
    }
  ];
}

function makeNotesArray() {
  return [
    {
      id: 1,
      notes_name: "Dogs",
      modified_date: "2019-08-10T23:47:03.708Z",
      content: "This is content for dog",
      folder: 3
    },
    {
      id: 2,
      notes_name: "Cats",
      modified_date: "2019-08-10T23:47:03.708Z",
      content: "This is content for dog",
      folder: 2
    },
    {
      id: 3,
      notes_name: "Frogs",
      modified_date: "2019-08-10T23:47:03.708Z",
      content: "This is content for dog",
      folder: 3
    },
    {
      id: 4,
      notes_name: "Bear",
      modified_date: "2019-08-10T23:47:03.708Z",
      content: "This is content for dog",
      folder: 1
    },
    {
      id: 5,
      notes_name: "Turtle",
      modified_date: "2019-08-10T23:47:03.708Z",
      content: "This is content for dog",
      folder: 1
    }
  ];
}

// function makeMaliciousFolder() {
//   const maliciousFolder = {
//     id: 911,
//     title: 'Naughty naughty very naughty <script>alert("xss");</script>',
//     url: 'https://www.hackers.com',
//     description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
//     rating: 1,
//   }
//   const expectedFolder = {
//     ...maliciousFolder,
//     title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
//     description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
//   }
//   return {
//     maliciousFolder,
//     expectedFolder,
//   }
// }

module.exports = {
  makeFoldersArray,
  makeNotesArray
  // makeMaliciousFolder,
};
