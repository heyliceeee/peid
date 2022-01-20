module namespace page = 'http://basex.org/examples/web-page';

declare
  %updating
  %rest:path("/addProposta")
  %rest:POST("{$body}")
function page:addProposta($body) {
    

  
  let $fd := 5000 - sum(db:open("propostas")/edificio[./localidade/text() = $body//localidade]//custo) 
  
  let $proposta := $body//proposta[number(./custo/text()) <= $fd][1]
  
  let $p := $body//proposta
  
  let $some := some $p/custo satisfies ($p <= $fd)
  
  let $newBody := 
    <edificio id="1">
      {$body//nome,$body//tipologia,$body//localidade, $body//facilidade, $proposta}
    </edificio>
    
    return  (
      
    db:add("propostas", $newBody, "trabalho.xml")
  )
};



