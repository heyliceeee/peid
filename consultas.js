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
    Converter os campos "capacidade" string -> int dentro de array
-------------------------------------------------------------------------------------------------------------------------



