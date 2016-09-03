'use strict';
var DB = require('./db.js');
var async = require('async');

/**
 * Database operations related to battles.
 * @class
 */
class BattleModel {
    /**
     * fetches list of battles.
     * @function
     * @param {function} callback - Callback.
     */
    list(callback){
        var query = "SELECT * FROM battles";
        DB.getConnection((err, connection) => {
            if(err){
                return callback(err);
            }
            connection.query(query, (err, rows) => {
                connection.release();
                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, rows);
            });
        });
    }

    /**
     * Provides total battles taken place.
     * @function
     * @param {function} callback - Callback.
     */
    count(callback){
        var query = "SELECT COUNT(*) AS 'count' FROM battles";
        DB.getConnection((err, connection) => {
            if(err){
                return callback(err);
            }
            connection.query(query, (err, rows) => {
                connection.release();
                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, rows[0]);
            });
        });
    }

    /**
     * fetch battle data based on name.
     * @function
     * @param {string} name - string to search by name.
     * @param {function} callback - Callback.
     */
    search(name, callback){
        var query = "SELECT * FROM battles WHERE";
        query += " `name` LIKE ?";
        DB.getConnection((err, connection) => {
            if(err){
                return callback(err);
            }
            connection.query(query, ['%'+name+'%'], (err, rows) => {
                connection.release();
                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null, rows);
            });
        });
    }

    /**
     * data required for statistics.
     * @function
     * @param {function} callback - Callback.
     */
    stats(callback){
        var stats = {  
            "most_active":{  
                "attacker_king":"",
                "defender_king":"",
                "region":"",
                "name":""
            },
            "attacker_outcome":{  
                "win":null,
                "loss":null
            },
            "battle_type":[  
                
            ],
            "defender_size":{  
                "average":null,
                "min":null,
                "max":null
            }
        }
        async.waterfall(
            [  
                function(callback){
                    DB.getConnection((err, connection) => {
                        if(err){
                            return callback(err);
                        }
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT `attacker_king`, COUNT(`attacker_king`) AS `attacker_king_count` FROM `battles` GROUP BY `attacker_king` ORDER BY `attacker_king_count` DESC LIMIT 1";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err);
                            return callback(err);
                        }
                        stats.most_active.attacker_king = rows[0].attacker_king;
                        console.log(stats);
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT `defender_king`, COUNT(`defender_king`) AS `defender_king_count` FROM `battles` GROUP BY `defender_king` ORDER BY `defender_king_count` DESC LIMIT 1";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err);
                            return callback(err, connection);
                        }
                        stats.most_active.defender_king = rows[0].defender_king;
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT `region`, COUNT(`region`) AS `region_count` FROM `battles` GROUP BY `region` ORDER BY `region_count` DESC LIMIT 1";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err);
                            return callback(err, connection);
                        }
                        stats.most_active.region = rows[0].region;
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT `attacker_outcome`, COUNT(*) as 'count' FROM battles GROUP BY `attacker_outcome`";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err, connection);
                            return callback(err);
                        }
                        for(let i = 0; i<rows.length; i++){
                            if(rows[i].attacker_outcome === 'win'){
                                stats.attacker_outcome.win = rows[i].count;
                            } else if(rows[i].attacker_outcome === 'loss'){
                                stats.attacker_outcome.loss = rows[i].count;
                            }                            
                        }
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT DISTINCT `battle_type` FROM `battles`";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err, connection);
                            return callback(err);
                        }
                        for(let i =0; i<rows.length; i++){
                            stats.battle_type.push(rows[i].battle_type);
                        }
                        callback(null, connection);
                    });
                },
                function(connection, callback){
                    let query = "SELECT MIN(CAST(`defender_size`AS DECIMAL(8,2))) as 'min', MAX(CAST(`defender_size`AS DECIMAL(8,2))) as max, AVG(CAST(`defender_size`AS DECIMAL(8,2))) as 'avg' FROM `battles` WHERE `defender_size` NOT IN('', 'null')";
                    connection.query(query, (err, rows) => {
                        if(err){
                            console.log(err);
                            return callback(err, connection);
                        }
                        stats.defender_size.average = rows[0].avg;
                        stats.defender_size.min = rows[0].min;
                        stats.defender_size.max = rows[0].max;
                        callback(null, connection);
                    });
                }
            ], 
            function(err, connection){
                if(!!connection){
                    connection.release();
                }
                if(err){
                    return callback(err);
                }
                console.log(stats);
                callback(null, stats);
            }
        )
    }

}

module.exports = BattleModel;