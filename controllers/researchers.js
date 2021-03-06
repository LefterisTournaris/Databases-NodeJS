const { pool } = require('../utils/database');

exports.getyoungResearchers = (req, res, next) => {
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        conn.promise().query(`SELECT DISTINCT
        CONCAT(first_name, ' ', last_name) AS full_name,
        TIMESTAMPDIFF(year, researchers.birth_date, CURRENT_DATE()) as age,
        COUNT(project_researcher_relationship.project_id) AS projects_number
        FROM researchers
        INNER JOIN project_researcher_relationship ON project_researcher_relationship.researcher_id = researchers.id
        INNER JOIN projects ON project_researcher_relationship.project_id = projects.id
        WHERE TIMESTAMPDIFF(year, researchers.birth_date, CURRENT_DATE()) < 40 AND projects.end_date IS NULL
        GROUP BY researchers.id
        ORDER BY projects_number DESC`)
        .then(([rows, fields]) => {
            res.render('young-researchers.ejs', {
                pageTitle: "Young Researchers Page",
                researchers: rows,
                messages: messages
            })
        })
        .then(() => pool.releaseConnection(conn))
        .catch(err => console.log(err))
    })
}

exports.createResearcher = (req, res, next) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const birth_date = req.body.birth_date;
    const organization_id = req.body.organization_id;
    const sex = req.body.sex;

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    pool.getConnection((err, conn) => {
        var sqlQuery = `INSERT INTO researchers(first_name, last_name, birth_date, organization_id, sex) VALUES(?, ?, ?, ?, ?)`;

        conn.promise().query(sqlQuery, [first_name, last_name, birth_date, organization_id, sex])
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully added a new Researcher!" })
            res.redirect('/');
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Researcher could not be added." })
            res.redirect('/');
        })
    })

}

exports.getResearchers = (req, res, next) => {
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        conn.promise().query(`SELECT * FROM researcher_info`)
        .then(([rows, fields]) => {
            res.render('researchers.ejs', {
                pageTitle: "Researchers Page",
                researchers: rows,
                messages: messages
            })
        })
        .then(() => pool.releaseConnection(conn))
        .catch(err => console.log(err))
    })
}

exports.postDeleteResearcher = (req, res, next) => {
    /* get id from params */
    const id = req.params.id;
    
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        var sqlQuery = (`DELETE FROM researchers WHERE id = ${id}`);
        conn.promise().query(sqlQuery)
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully deleted Researcher!" })
            res.redirect('/researchers');
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Researcher could not be deleted." })
            res.redirect('/researchers');
        })
    })
}