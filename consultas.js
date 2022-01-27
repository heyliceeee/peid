-------------------------------------------------------------------------------------------------------------------------
    Converter os campos "id" e "nivelSatisfacao" string -> int
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        { '$addFields': { 'id': { '$toInt': '$id' } } },
        { '$addFields': { 'nivelSatisfacao': { '$toInt': '$nivelSatisfacao' } } },
        { '$out': 'edificios' }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Converter o object "proposta" em array
-------------------------------------------------------------------------------------------------------------------------

var docs = db.edificios.aggregate([
    { $match: { "proposta": { $exists: true } } },
    { $addFields: { proposta: ["$proposta"] } }
])

docs.forEach(function (doc) {
    db.edificios.updateOne({ _id: doc._id }, { $set: { proposta: doc.proposta } })
})



-------------------------------------------------------------------------------------------------------------------------
    Converter o campo "capacidade" string -> int dentro de array
-------------------------------------------------------------------------------------------------------------------------

var docs = db.edificios.aggregate([
    { $unwind: "$facilidade" },
    { $addFields: { "facilidade.capacidade": { $toInt: "$facilidade.capacidade" } } },
    { $group: { _id: "$_id", facilidade: { $push: "$facilidade" } } }
])

docs.forEach(function (doc) {
    db.edificios.updateOne({ _id: doc._id }, { $set: { facilidade: doc.facilidade } })
})



-------------------------------------------------------------------------------------------------------------------------
    Converter o campo "custo" string -> int dentro de array
-------------------------------------------------------------------------------------------------------------------------

var docs = db.edificios.aggregate([
    { $unwind: "$proposta" },
    { $addFields: { "proposta.custo": { $toInt: "$proposta.custo" } } },
    { $group: { _id: "$_id", proposta: { $push: "$proposta" } } }
])

docs.forEach(function (doc) {
    db.edificios.updateOne({ _id: doc._id }, { $set: { proposta: doc.proposta } })
})



-------------------------------------------------------------------------------------------------------------------------
    Converter o array "proposta" em object
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.updateMany({}, [
        { '$addFields': { 'proposta': { '$arrayElemAt': ['$proposta', 0] } } }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Renomear a coleção "admin_name" e "population" na coleção "Coordenadas"
-------------------------------------------------------------------------------------------------------------------------

    db.coordenadas.updateMany({}, { $rename: { "admin_name": "distrito", "population": "populacao" } })



-------------------------------------------------------------------------------------------------------------------------
    Converter "populacao" para inteiro na coleção "Coordenadas"
-------------------------------------------------------------------------------------------------------------------------

    db.coordenadas.aggregate([
        { '$addFields': { "populacao": { $toInt: "$populacao" } } },
        { '$out': "coordenadas" }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Embutir a coleção "Coordenadas" na coleção "Edificios"
-------------------------------------------------------------------------------------------------------------------------

var coor = db.coordenadas.find()

coor.forEach(function (doc) {
    db.edificios.updateMany({ localidade: doc.city }, { $set: { "coordenada": doc } });
});
db.edificios.updateMany({}, { $unset: { "coordenada._id": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.country": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.iso2": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.capital": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.population_proper": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.city": "" } })






-------------------------------------------------------------------------------------------------------------------------
    CONSULTAS
-------------------------------------------------------------------------------------------------------------------------

    -------------------------------------------------------------------------------------------------------------------------
        Apresentar total edifícios registados, por tipologia(monumento, ...)

--nao tenho acerteza se funciona--
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        { '$group': { '_id': '$tipologia', 'totalEdificios': { '$sum': 1 } } }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar, por distrito e por tipologia, a média do custo das propostas aceites

--nao tenho acerteza se funciona--
-------------------------------------------------------------------------------------------------------------------------

    //por distrito

    db.edificios.aggregate([
        { '$group': { '_id': '$coordenada.admin_name', 'media': { '$avg': '$proposta.custo' } } }
    ])



//por tipologia

db.edificios.aggregate([
    { '$group': { '_id': '$tipologia', 'media': { '$avg': '$proposta.custo' } } }
])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar a percentagem das propostas aceites que obtiveram um nível de satisfação superior a 90

--nao tenho acerteza se funciona(n quero mostrar o _id)--
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        { '$match': { 'nivelSatisfacao': { '$gte': 90 } } },
        { '$project': { 'percentagem': { '$multiply': [{ '$divide': ['$nivelSatisfacao', 100] }, 100] } } }
    ])
