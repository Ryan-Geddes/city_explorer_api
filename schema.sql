-- What are we doing here?
-- Assume we have database created
-- Automate the stuff in the CLI

DROP TABLE IF EXISTS locationdb;

CREATE TABLE locationdb(
    id SERIAL PRIMARY KEY,
    lat VARCHAR (255),
    lon VARCHAR (255),
    formatted_query VARCHAR (255), 
    search_query VARCHAR (255)
);

