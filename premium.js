(function() {
   
  var script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
  
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
  

  var locatie=window.location.href;

  if(!(locatie.includes("screen=market&mode=exchange")))
  {
    alert("Scriptul trebui rulat la market->exchange \n Te redirectionez acum");
    window.location.href=location+"&screen=market&mode=exchange";
  }
    

  window.setTimeout(function()
  {
    $(".content-border").append('<link rel="stylesheet"href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />');

    $(".content-border").append('<p style="font-size: 20px;padding: 10px;font-weight: bold;text-align: center;background-color: #F5F5DC;">Introdu valorile pentru a vinde/cumpara resurse:</p ><br>');

    $(".content-border").append(`<div class="container" style="width: 100%;">
  <table class="table table-hover" >
    <tr>
      <td> </td>
      <td> <p style="font-weight: bold;position: relative;left: 25px;">Vinde</p></td>
      <td> <p style="font-weight: bold;position: relative;left: 5px;">Avertiseaza</p></td>
    </tr>
    <tr>
      <td><p style="font-weight: bold";>Lemn : </p></td>
      <td><input type="text" id="lemn_vinde" style="text-align:center;width: 30%;"></td>
      <td><input type="text" id="lemn_avert" style="text-align:center;width: 30%;"></td>
  </tr>
  <tr>
    <td><p style="font-weight: bold";>Argila : </p></td>
    <td><input type="text" id="argila_vinde" style="text-align:center;width: 30%;"></td>
    <td><input type="text" id="argila_avert" style="text-align:center;width: 30%;"></td>
  </tr>
  <tr>
  <td><p style="font-weight: bold";>Fier : </p></td>
  <td><input type="text" id="fier_vinde" style="text-align:center;width: 30%;"></td>
  <td><input type="text" id="fier_avert" style="text-align:center;width: 30%;"></td>
  </tr>
  <tr>
  <td><p style="font-weight: bold";>Refresh pagina :</p></td>
  <td><input type="text" style="text-align:center;width: 30%;" id="refresh" placeholder="secunde"></td>
  <td><p style="font-weight: bold;font-size:16px; position: relative;left: 35px;" id="nr_refresh"></p></td>
  </tr>
  </table>
  </div>`);
    



    $(".content-border").append(`
    <div class="jumbotron text-center" style="background-color: transparent">
      <div class="btn-group"style="position: center" >
        <button type="button" class="btn btn-primary" id="btn1">Start</button>
        <button type="button" class="btn btn-primary" id="btn2">Stop</button>
      </div> 
    </div>`);
    


    var id=0;
    var secunde=0;
    $("#btn1").click(function()
    {
      $("#btn1").css('pointer-events', 'none');
      var refresh=$("#refresh").val()*1000;

    if(refresh>0)
    {
      id=window.setInterval(function()
      {
        var lemn_premium=$("#premium_exchange_rate_wood").text().replace(/ /g,'').split("\n")[1];
        var argila_premium=$("#premium_exchange_rate_stone").text().replace(/ /g,'').split("\n")[1];
        var fier_premium=$("#premium_exchange_rate_iron").text().replace(/ /g,'').split("\n")[1];

        var lemn_stoc=parseInt($("#premium_exchange_capacity_wood").text())-parseInt($("#premium_exchange_stock_wood").text());
        var argila_stoc=parseInt($("#premium_exchange_capacity_stone").text())-parseInt($("#premium_exchange_stock_stone").text());
        var fier_stoc=parseInt($("#premium_exchange_capacity_iron").text())-parseInt($("#premium_exchange_stock_iron").text());
        
        console.log("secunde: "+secunde);
        console.log("lemn: "+lemn_premium);
        console.log("argila: "+argila_premium);
        console.log("fier: "+fier_premium);
        console.log("\n");
        secunde=secunde+1;

        var lemn_total=$("#wood").text();
        var argila_total=$("#stone").text();
        var fier_total=$("#iron").text();

        var lemn_vinde=$("#lemn_vinde").val();
        var lemn_avert=$("#lemn_avert").val();

        var argila_vinde=$("#argila_vinde").val();
        var argila_avert=$("#argila_avert").val();

        var fier_vinde=$("#fier_vinde").val();
        var fier_avert=$("#fier_avert").val();

        $("#nr_refresh").text(secunde);

        if(parseInt(lemn_premium)<parseInt(lemn_vinde) && parseInt(lemn_total)>parseInt(lemn_premium) && parseInt(lemn_stoc)!=0)
        {

          if(parseInt(lemn_total)>parseInt(lemn_stoc))
            $('input[name*="sell_wood"]').val(Math.abs(lemn_stoc-lemn_vinde));
          else
            $('input[name*="sell_wood"]').val(Math.abs(lemn_total-lemn_vinde));

          $("input[type*=submit]").click();
          window.setTimeout(function()
          {
            $("button:contains('Confirm')").get(0).click();
            
          },500)
        }
        else if(parseInt(lemn_premium)<parseInt(lemn_avert))
        {
          var melodie =new Audio("http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/alien_shoot.wav");
          melodie.play();
        }
          




        if(parseInt(argila_premium)<parseInt(argila_vinde) && parseInt(argila_total)>parseInt(argila_premium)  && parseInt(argila_stoc)!=0)
        {

          if(parseInt(argila_total)>parseInt(argila_stoc))
            $('input[name*="sell_stone"]').val(Math.abs(argila_stoc-argila_vinde));
          else
            $('input[name*="sell_stone"]').val(Math.abs(argila_total-argila_vinde));

          $("input[type*=submit]").click();
          window.setTimeout(function()
          {
            $("button:contains('Confirm')").get(0).click();
          },500)
        }
        else if(parseInt(argila_premium)<parseInt(argila_avert))
        {
          var melodie =new Audio("http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/alien_shoot.wav");
          melodie.play();
        }
        


        if(parseInt(fier_premium)<parseInt(fier_vinde) && parseInt(fier_total)>parseInt(fier_premium) && parseInt(fier_stoc)!=0)
        {
          if(parseInt(fier_total)>(parseInt(fier_stoc)))
            $('input[name*="sell_iron"]').val(Math.abs(fier_stoc-fier_vinde));
          else
            $('input[name*="sell_iron"]').val(Math.abs(fier_total-fier_vinde));

          $("input[type*=submit]").click();
          window.setTimeout(function()
          {
            $("button:contains('Confirm')").get(0).click();
            
          },500)
        }
        else if(parseInt(fier_premium)<parseInt(fier_avert))
        {
          var melodie =new Audio("http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/alien_shoot.wav");
          melodie.play();
        }
      },refresh);
    }
    else
    {
      alert("seteaza refresh pagina!");
      $("#btn1").css('pointer-events', 'all');
    }

    });


    $("#btn2").click(function()
    {
      window.clearInterval(id);
      $("#btn1").css('pointer-events', 'all');
    });
  },1000);
      
    


  })();
