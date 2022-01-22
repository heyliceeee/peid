-------------------------------------------------------------------------------------------------------------------------
    Converter os campos "id" e "nivelSatisfacao" string -> int
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        { '$addFields': { 'id': { '$toInt': '$id' } } },
        { '$addFields': { 'nivelSatisfacao': { '$toInt': '$nivelSatisfacao' } } },
        { '$out': 'edificios' }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Converter o object "facilidade" em array
-------------------------------------------------------------------------------------------------------------------------

var docs = db.edificios.aggregate([
    { $match: { "facilidade": { $exists: true } } },
    { $addFields: { facilidade: ["$facilidade"] } }
])

docs.forEach(function (doc) {
    db.edificios.updateOne({ _id: doc._id }, { $set: { facilidade: doc.facilidade } })
})



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


