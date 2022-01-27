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
    Converter "populacao" para "0" caso seja vazio na coleção "Coordenadas"
-------------------------------------------------------------------------------------------------------------------------

    db.coordenadas.updateMany({ populacao: "" }, {
        '$set': {
            'populacao': '0'
        }
    })



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
db.edificios.updateMany({}, { $unset: { "coordenada.city": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.country": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.iso2": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.capital": "" } })
db.edificios.updateMany({}, { $unset: { "coordenada.population_proper": "" } })






-------------------------------------------------------------------------------------------------------------------------
    CONSULTAS
-------------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------------
        Apresentar total edifícios registados, por tipologia(monumento, ...)
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        {
            '$group': {
                '_id': '$tipologia', 
                'totalEdificios': {
                    '$sum': 1
                }
            }
        }, {
            '$project': {
                '_id': 0, 
                'tipologia': '$_id', 
                'totalEdificios': '$totalEdificios'
            }
        }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar, por distrito e por tipologia, a média do custo das propostas aceites
    
    Nota - Distrito -  Ordenado pela Média Descendente

    Nota - Tiplogia -  Ordenado pela tipologia ascendente
-------------------------------------------------------------------------------------------------------------------------

    //por distrito

    db.edificios.aggregate([
            {
                '$group': {
                    '_id': '$coordenada.distrito', 
                    'media': {
                        '$avg': '$proposta.custo'
                    }
                }
            }, {
                '$project': {
                    '_id': 0, 
                    'distrito': '$_id', 
                    'media': '$media'
                }
            }, {
                '$sort': {
                    'media': -1
                }
            }
    ])



//por tipologia

db.edificios.aggregate([
    {
        '$group': {
            '_id': '$tipologia', 
            'media': {
                '$avg': '$proposta.custo'
            }
        }
    }, {
        '$project': {
            '_id': 0, 
            'tipologia': '$_id', 
            'media': '$media'
        }
    }, {
        '$sort': {
            'tipologia': 1
        }
    }
])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar a percentagem das propostas aceites que obtiveram um nível de satisfação superior a 90
-------------------------------------------------------------------------------------------------------------------------

    var total = db.edificios.count()

db.edificios.aggregate([
    {
        '$match': { 'nivelSatisfacao': { '$gte': 90 } }
    },

    {
        '$group': {
            '_id': 0,
            'count90': { '$sum': 1 }
        }
    },

    {
        '$project': {
            '_id': 0,
            'percentagem': {
                '$concat': [
                    {
                        '$toString': {
                            '$multiply': [
                                { '$divide': ['$count90', total] }, 100
                            ]
                        }
                    }, '%'
                ]
            }
        }
    }
])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar o total de edificios por localidade
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
    {
        '$group': {
            '_id': '$localidade', 
            'total': {
                '$sum': 1
            }
        }
    }, {
        '$project': {
            '_id': 0, 
            'localidade': '$_id', 
            'total': '$total'
        }
    }
    ])



-------------------------------------------------------------------------------------------------------------------------
    Apresentar o Financiamento Disponivel por localidade
-------------------------------------------------------------------------------------------------------------------------

    db.edificios.aggregate([
        {
            '$group': {
                '_id': '$localidade', 
                'totalPropostas': {
                    '$sum': '$proposta.custo'
                }
            }
        }, {
            '$project': {
                '_id': 0, 
                'localidade': '$_id', 
                'F_Disponivel': {
                    '$concat': [
                        {
                            '$toString': {
                                '$subtract': [
                                    5000, '$totalPropostas'
                                ]
                            }
                        }, ' €'
                    ]
                }
            }
        }
    ]