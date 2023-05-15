const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const app = express();
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "moviesData.db");
app.use(express());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorID: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
initializeDBAndServer();
app.get("/movies/", async (request, response) => {
  const getmovies = `SELECT * FROM movie`;
  const movieslist = await db.all(getmovies);
  response.send(
    movieslist.map((each) => convertDbObjectToResponseObject(each))
  );
});
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor= '${leadActor}'
  WHERE
    movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getdirectors = `SELECT * FROM director`;
  const directorslist = await db.all(getdirectors);
  response.send(
    directorslist.map((each) => convertDbObjectToResponseObject1(each))
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `
    SELECT 
      movie_name 
    FROM 
      movie 
    WHERE 
      director_id = ${directorId};`;
  const movie = await db.all(getMovieQuery);
  response.send(convertDbObjectToResponseObject2(movie));
});
module.exports = app;
