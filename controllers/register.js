const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password)
  // use a transaction when you have to do more than two things at once
  // use the trx obj instead of the db to do the operations (insert)
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0])
          })
        })
        // make sure to commit
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
  handleRegister: handleRegister
}