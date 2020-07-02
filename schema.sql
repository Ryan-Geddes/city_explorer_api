-- What are we doing here?
-- Assume we have database created
-- Automate the stuff in the CLI

DROP TABLE IF EXISTS locationdb;

CREATE TABLE locationdb(
    id SERIAL PRIMARY KEY,
    latitude VARCHAR (255),
    longitude VARCHAR (255),
    formatted_query VARCHAR (255), 
    search_query VARCHAR (255)
);

