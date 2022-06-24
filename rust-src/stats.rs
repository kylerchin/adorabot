
// url of cassandra server

extern crate scylla;
extern crate tokio;
extern crate serde_json;
extern crate serde;
use std::error::Error;
use scylla::{Session, SessionBuilder};
use std::io::Read;
use std::fs::File;
use serde_json::{Result, Value};
extern crate uuid;
use crate::scylla::IntoTypedRows;
use scylla::transport::errors::NewSessionError;

use uuid::Uuid;

use serde::{Deserialize, Serialize};
// mandatory lines to use json in rust
#[derive(Debug, Deserialize, Serialize)]

struct Cassandraconfig {
    contactPoints: [ String; 1],
    localDataCenter: String,
    plainTextPassword: String,
    plainTextUsername: String
}

struct Configstrut {

cassandra: Cassandraconfig

}

struct Configout {
    config: Configstrut
}



fn main() {


    //let json_file_path = Path::new();

    const file: std::result::Result<File, std::io::Error> = File::open("../config.json")::unwrap();
    
    //const foo: String = fs::read_to_string("../config.json")?.parse()?;

    const configpre:Configout = serde_json::from_str(file) as Configout;
    .expect("error while reading or parsing");

    const config:Configstrut = configpre["config"] as Configstrut;

    const username: String = config["cassandra"]["plainTextUsername"] as String;
    
    const password: String = config["cassandra"]["plainTextPassword"] as String;

    
async fn getallurls() -> Result<()> {

 
    let session: Session = SessionBuilder::new()
        .known_node("127.0.0.1:9042")
        .user(username, password)
        .build()
        .await?;
    
        if let Some(rows) = session.query("SELECT videoid, added FROM adorastats.trackedytvideosids", &[]).await?.rows {
            for row in rows.into_typed::<(String,uuid::Uuid)>() {
                let (videoid, added) = row?;
                println!("videoid, added: {}, {}", videoid, added);
            }
        }
    
    Ok(())
    }


    getallurls();

    Ok(0);
}