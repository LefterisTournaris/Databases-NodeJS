const { pool } = require('../utils/database');

/* Controller to retrieve projects from database */
exports.getProjects = (req, res, next) => {

     /* check for messages in order to show them when rendering the page */
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    /* create the connection, execute query, render data */
    pool.getConnection((err, conn) => {
        
        conn.promise().query('SELECT * FROM project_info ORDER BY id ASC')
        .then(([rows, fields]) => {
            res.render('projects.ejs', {
                pageTitle: "Projects Page",
                projects: rows,
                messages: messages
            })
        })
        .then(() => pool.releaseConnection(conn))
        .catch(err => console.log(err))
    })

}

/* Controller to select researcher from project database */
exports.getSelectResearcherProject = (req, res, next) => {
    /* get id from params */
    const id = req.params.id;
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        var sqlQuery = (`SELECT DISTINCT researchers.id, CONCAT(first_name, ' ', last_name) as full_name, TIMESTAMPDIFF(year, researchers.birth_date, CURRENT_DATE()) as age, sex
        FROM researchers
        INNER JOIN project_researcher_relationship ON project_researcher_relationship.researcher_id = id
        INNER JOIN projects ON project_researcher_relationship.project_id = projects.id
        WHERE projects.id = ${id}`);

        conn.promise().query(sqlQuery)
        .then(([rows, fields]) => {
            res.render('show-researchers.ejs', {
                pageTitle: "Researchers Page",
                researchers: rows,
                messages: messages
            })
        })
        .then(() => pool.releaseConnection(conn))
        .catch(err => console.log(err))
    })

}

exports.postProject = (req, res, next) => {

    /* get necessary data sent */
    const title = req.body.title;
    const summary = req.body.summary;
    const budget = req.body.budget;
    const starting_date = req.body.starting_date;
    let end_date = req.body.end_date;
    if (end_date = '0000-00-00') end_date = null;
    const employee_id = req.body.employee_id;

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];
    /* create the connection, execute query, flash respective message and redirect to home page */
    pool.getConnection((err, conn) => {
        var sqlQuery = `INSERT INTO projects(title, summary, budget, starting_date, end_date, employee_id) VALUES(?, ?, ?, ?, ?, ?)`;

        conn.promise().query(sqlQuery, [title, summary, budget, starting_date, end_date, employee_id])
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully added a new Project!" })
            res.redirect('/');
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Project could not be added." })
            res.redirect('/');
        })
    })
}

exports.postAddResearcher = (req, res, next) => {

    /* get necessary data sent */
    const project_id = req.body.project_id;
    const researcher_id = req.body.researcher_id;

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        var sqlQuery = `INSERT INTO project_researcher_relationship(project_id, researcher_id) VALUES(?, ?)`;

        conn.promise().query(sqlQuery, [project_id, researcher_id])
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully added a new Researcher!" })
            res.redirect('/projects/show-researchers/' + project_id);
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Researcher could not be added." })
            res.redirect('/projects/show-researchers/' + project_id);
        })
    })
}

exports.postUpdateProject = (req, res, next) => {

    /* get necessary data sent */
    const id = req.body.id;
    const title = req.body.title;
    const summary = req.body.summary;
    const budget = req.body.budget;
    const starting_date = req.body.starting_date;
    let end_date = req.body.end_date;
    if (end_date = '0000-00-00') end_date = null;
    const employee_id = req.body.employee_id;
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        var sqlQuery = `UPDATE projects SET title = ?, summary = ?, budget = ?, starting_date = ?, end_date = ?, employee_id = ? WHERE id = ${id}`;

        conn.promise().query(sqlQuery, [title, summary, budget, starting_date, end_date, employee_id])
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully updated project!" })
            res.redirect('/projects');
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Project could not be updated." })
            res.redirect('/projects');
        })
    })
}

exports.postDeleteProject = (req, res, next) => {
    /* get id from params */
    const id = req.params.id;
    
    /* create the connection, execute query, flash respective message and redirect to grades route */
    pool.getConnection((err, conn) => {
        var sqlQuery = (`DELETE FROM projects WHERE id = ${id}`);
        conn.promise().query(sqlQuery)
        .then(() => {
            pool.releaseConnection(conn);
            req.flash('messages', { type: 'success', value: "Successfully deleted project!" })
            res.redirect('/projects');
        })
        .catch(err => {
            req.flash('messages', { type: 'error', value: "Something went wrong, Project could not be deleted." })
            res.redirect('/projects');
        })
    })
}