//Importar o express
const express = require('express');

//Importar o database
const database = require("./database")

//Importar o body-parser
const bodyParser = require('body-parser')

//importar o cors
const cors = require('cors')

//Criar uma instância do express
const app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

//Rotas ALUNO
//GET
app.get('/alunos', (req, res) => {
    database.query('SELECT * FROM aluno', (err, result) => {
        if (err) {
            return res.status(500).json(err)
        }

        if(result.length > 0) {
            return res.status(200).json(result)
        }
        
        return res.status(200).json({message: 'Nenhum aluno cadastrado!'})
        
    })
})

//POST
app.post('/aluno', (req, res) => {
    let nome = req.body.nome
    let telefone = req.body.telefone
    let status = req.body.status


    if (!nome ||!telefone ||!status) {
        return res.status(400).json({message: 'Todos os dados são obrigatórios'})
    }

    database.query('INSERT INTO aluno(nome, telefone, status) VALUES (?, ?, ?)', [nome, telefone, status], (err, result) => {
        if(err){
            return res.status(500).json(err)
        }

        return res.status(201).json({message: 'Aluno cadastrado com sucesso!', aluno: result.insertId})
    })

})

//DELETE

app.delete('/aluno/:id',(req, res) => {

    let id = req.params.id

        database.query('DELETE FROM aluno WHERE id = ?',[id], (err,result) =>{
            if(err){
                return res.status(500).json(err)
            }

            if(result.affectedRows > 0){

                return res.status(201).json({message: 'Aluno deletado com sucesso!'})
            }

            return res.status(404).json({message: 'Aluno não encontrado!'})
     
       })
    
})

//UPDATE

app.put('/aluno/:id',(req, res) =>{

    let id = req.params.id
    let nome = req.body.nome
    let telefone = req.body.telefone
    let status = req.body.status

    if(!nome || !telefone || !status){

        return res.status(400).json({message: 'Todos os dados são obrigatórios'})
    }

        database.query('UPDATE aluno SET nome = ?,telefone = ?, status = ? WHERE id = ?',[nome,telefone,status,id] ,(err, result) =>{

            if(err){
                return res.status(500).json(err)
            }

            if(result.affectedRows > 0){

                return res.status(201).json({message: 'Aluno atualizado com sucesso!'})
            }

            return res.status(404).json({message: 'Aluno não encontrado!'})
        })
})


//TURMS

app.get('/turmas', (req, res) =>{

    database.query('SELECT * FROM turma',(err, result) =>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.length > 0){
            return res.status(200).json(result)
        }

        return res.status(200).json({message: 'Nenhuma turma cadastrada!'})

    })
})

app.post('/turma',(req,res) =>{

    let nome = req.body.nome
    

    if(!nome){

        return res.status(400).json({message: 'Todos os dados são obrigatórios'})
    }

    database.query('INSERT INTO turma (nome) VALUES (?)',[nome ],(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

       

        return res.status(201).json({message: 'Turma cadastrado com sucesso!', turma: result.insertId})
        
    })
})

app.delete('/turma/:id',(req,res)=>{
    
    let id = req.params.id

    database.query('DELETE FROM turma WHERE id  = ?',[id],(err, result)=>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.affectedRows > 0){

            return res.status(201).json({message: 'Turma deletado com sucesso!'})
        }

        return res.status(404).json({message: 'Turma não encontrada!'})
    })
})

app.put('/turma/:id',(req,res)=>{

    let id = req.params.id
    let nome = req.params.nome

    if(!nome){

        return res.status(400).json({message: 'Todos os dados são obrigatórios'})
    }

    database.query('UPDATE turma SET nome = ? WHERE id = ?',[nome,id],(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.affectedRows > 0){

            return res.status(201).json({message: 'Turma atualizada com sucesso!'})
        }

        return res.status(404).json({message: 'Turma não encontrado!'})
    })
})

app.get('/lista',(req,res)=>{
    database.query('SELECT a.id, a.nome aluno, t.nome turma FROM aluno a INNER JOIN turma t ON a.fk_turma = t.id',(err, result)=>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.length > 0){

            return res.status(200).json(result)
        }

        return res.status(200).json({message: 'Nenhuma matrícula realizada!'})
    })
})

   




//ROTAS MATRICULAS

//MATRICULAR

app.put('/matricula',(req,res)=>{
    let alunoId = req.body.aluno_id
    let turmaId = req.body.turma_id

    database.query('UPDATE aluno SET fk_turma =? WHERE id =?',[turmaId,alunoId],(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.affectedRows > 0){
            addAluno(turmaId)
            return res.status(201).json({message: 'Matricula  realizada com sucesso!'})
        }

        return res.status(404).json({message: 'Aluno ou Turma  não encontrado!'})
    })
})


app.put('/offmatricula',(req,res)=>{

    let aluno_id = req.body.aluno_id
    let turma_id = req.body.turma_id
   
        database.query('UPDATE aluno SET fk_turma=? WHERE id=?',[null,aluno_id],(err,result)=>{
        if(err){
            return res.status(500).json(err)
        }

        if(result.affectedRows > 0){
            delAluno(turma_id)
            return res.status(201).json({message: 'Desmatricula realizada com sucesso!'})
        }

        return res.status(404).json({message: 'Aluno não encontrado!'})
    })
})




//FUNCÇÕES PARA ALTERAR QUANTIDADE DE ALUNO POR TURMA


//INCREMENTAR

function addAluno(idturma){

    database.query('UPDATE turma SET quantidade = quantidade+1 WHERE id=?',[idturma],(err,result)=>{
        if(err){
            console.error(err)
        }
    })
}

//DECREMENTAR

function delAluno(idturma){

    database.query('UPDATE turma SET quantidade = quantidade-1 WHERE id=?',[idturma],(err,result)=>{
        if(err){
        console.error(err)
        }
    })

}

app.listen(3000, () => console.log(`Servidor rodando na porta ${3000}.`))