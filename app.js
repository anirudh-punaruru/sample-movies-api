const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
    select movie_name
    from movie;`;
  const movieArray = await db.all(getMoviesQuery);
  res.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const postMovieQuery = `
    insert into
    movie (director_id, movie_name, lead_actor)
    values ('${directorId}', '${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  res.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `
    select *
    from movie
    where movie_id= '${movieId}';`;
  const movie = await db.get(getMovieQuery);
  res.send(convertDbMovieObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const { movieId } = req.params;
  const updateMovieQuery = `
    update movie
    set director_id= '${directorId}', movie_name= '${movieName}', lead_actor= '${leadActor}'
    where movie_id= '${movieId}';`;
  await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `
    delete 
    from movie
    where movie_id= '${movieId}';`;
  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
    select *
    from director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  res.send(
    directorsArray.map((eachDir) =>
      convertDbDirectorObjectToResponseObject(eachDir)
    )
  );
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getDirectorMoviesQuery = `
    select movie_name
    from movie
    where director_id= '${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  res.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
