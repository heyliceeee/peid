module namespace page = 'http://basex.org/examples/web-page';

(: ------ submeter edificio - PROBLEMA: mesmo q nenhuma proposta do edificio seja aceite, submete na db as informações acerca do edificio ------ :)

declare
  %updating
  %rest:path("/addProposta")
  %rest:POST("{$body}")
  
  
function page:addProposta($body) {
    
  let $fd := 5000 - sum(db:open("propostas")/edificio[./localidade/text() = $body//localidade]//custo) (: fd (financiamento disponível) = financiamento máximo - soma do custo das propostas aceites numa determinada localidade :)
  
  let $proposta := $body//proposta[number(./custo/text()) <= $fd][1] (: proposta = custo da primeira proposta que seja menor ou igual ao financiamento disponível :)
  
  let $p := $body//proposta (: p (proposta) = propostas do documento :)
  
  let $custo := $p/custo (: custo = custo das propostas do documento :)
  
  let $count := 1 + count(db:open("propostas")/edificio) (: autoincrement ID :)
  
 
  let $newBody := 
    <edificio id="{$count}">
      {$body//nome, $body//tipologia, $body//localidade, $body//facilidade, $proposta}
    </edificio>
    (: newBody = nome, tipologia, localidade e facilidade do documento, e proposta aceite :)
    
    let $some := some $newBody in ("trabalho.xq") satisfies ($proposta) (: verificar se o proposta vem vazio (sem proposta aceite) :)
    
    return (update:output("Sucesso. Proposta válida"), db:add("propostas", $newBody, "trabalho.xml"))
    
    
   (: return if ($some = 'true()') then
      
      db:add("propostas", $newBody, "trabalho.xml")
      <response> Sucesso. Proposta válida: {$proposta} </response>
      
   else
    
      <response> Erro. Proposta inválida. Tente novamente </response> :)
};



(: ------ indicar o nivel de satisfação da proposta implementada - PROBLEMA: duplica edificio com nivel de satisfação ------ :)

declare
  %updating
  %rest:path("/avaliar/{$id}")
  %rest:POST("{$nivel}")
  
  
function page:avaliar($id, $nivel as xs:integer) {
    
    let $edificio := db:open("propostas")/edificio[@id = $id] (: edificio do ID escrito :)
    
    let $newBody := 
    <edificio id="{$id}">
      {$edificio//nome, $edificio//tipologia, $edificio//localidade, $edificio//facilidade, $edificio//proposta}
      <nivelSatisfacao>{$nivel}</nivelSatisfacao>
    </edificio>
    
    
    return (db:add("propostas", $newBody, "trabalho.xml"))
};
