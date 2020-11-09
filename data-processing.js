module.exports = function(csvArray) {
  var btoa = require('btoa');

  var headers = csvArray[0];
  var finalJson = {};
  var jsonArr = [];
  var jsonString;

  var dataMappingKey = [
    'Code client ou identifiant client', // 0
    'Centre de cout', // 1
    'Prénom', // 2
    'Nom', // 3
    'Titre', // 5
    'Code Postal', // 9
    'Pays', //10
    'Téléphone',//11
    'E-mail',//12
    'Date de création compte VEL',//13
    'Date de création compte jeff club',//14
    'Date de dernière connexion VEL',//15
    'Date de dernière connexion jeff club',//16
    'inscription newsletter VEL',//17
    'inscription newsletter Jeff Club',//18
    'Date de naissance',//19
    'Code client du magasin préféré pour les clients Jeff club'//20
  ];

  var importColumnIndexMapping = [];
  for (var i = 0; i < dataMappingKey.length; i++) {
    var index = headers.indexOf(dataMappingKey[i]);
    importColumnIndexMapping.push(index);
  }
  for (var i = 1; i < csvArray.length; i++) {
    var obj = {};
    var currentLine = csvArray[i];//.split(';');
    for (var j = 0; j < headers.length; j++) {
      var index = importColumnIndexMapping.indexOf(j);
      if (index == -1) {
        continue;
      }

      obj['type'] = 'identify';

      if (!obj['traits']) {
        obj['traits'] = {};
      }
      // Add currentLine value
      if (index == 0) {
        obj['traits']['id_sedona'] = currentLine[j];
      } else if (index == 1) {
        if (currentLine[j].indexOf('JC') > -1) {
          obj['traits']['jeffClub'] = 1;
        } else {
          obj['traits']['jeffClub'] = 0;
        }
        if (currentLine[j].indexOf('VEL') > -1) {
          obj['traits']['vel_customer'] = 1;
        }
      } else if (index == 2) {
        obj['traits']['firstName'] = currentLine[j];
      } else if (index == 3) {
        obj['traits']['lastName'] = currentLine[j];
      } else if (index == 4) {
        if (currentLine[j] == 'mr') {
          obj['traits']['gender'] = 'm';
          obj['traits']['title'] = 'Monsieur';
        } else if (currentLine[j] == 'mm' || currentLine[j] == 'ms' ) {
          obj['traits']['gender'] = 'mme';
          obj['traits']['title'] = 'Madame';            
        }
      } else if (index == 5) {
        obj['traits']['postal_code'] = currentLine[j];
      } else if (index == 6) {
        obj['traits']['country'] = currentLine[j];
      } else if (index == 7) {
        if (
          currentLine[j].startsWith('06') ||
          currentLine[j].startsWith('07') ||
          currentLine[j].startsWith('+336') ||
          currentLine[j].startsWith('+337') ||
          currentLine[j].startsWith('00336') ||
          currentLine[j].startsWith('00337')
        ) {
          obj['traits']['mobile_phone'] = currentLine[j];
        } else {
          obj['traits']['phone'] = currentLine[j];
        }
      } else if (index == 8) {
        obj['traits']['email'] = currentLine[j];
        obj['userId'] = btoa(currentLine[j]); //user id = email encoded in base 64
      } else if (index == 9) {
        var jeffclub_date = currentLine[importColumnIndexMapping[index + 1]];
        if (currentLine[j] == '') {
          obj['traits']['created_at'] = jeffclub_date;
          obj['traits']['updated_at'] = jeffclub_date;
        } else if (jeffclub_date == '') {
          obj['traits']['created_at'] = currentLine[j];
          obj['traits']['updated_at'] = currentLine[j];
        } else if (currentLine[j] > jeffclub_date) {
          obj['traits']['created_at'] = jeffclub_date;
          obj['traits']['updated_at'] = jeffclub_date;
        } else {
          obj['traits']['created_at'] = currentLine[j];
          obj['traits']['updated_at'] = currentLine[j];
        }
      } else if (index == 10) {

      } else if (index == 11) {
        obj['traits']['last_connexion_vel'] = currentLine[j];
      } else if (index == 12) {
        obj['traits']['last_connexion_jeffclub'] = currentLine[j];
      } else if (index == 13) {
        if(currentLine[j] == 'Oui'){
          obj['traits']['optin_web_newsletter'] = 1;
        }
        else{
          obj['traits']['optin_web_newsletter'] = 0;
        }
        obj['traits']['date_optin_web_newsletter'] = currentLine[importColumnIndexMapping[9]];
      } else if (index == 14) {
        if(currentLine[j] == 'Oui'){
          obj['traits']['optin_jeffclub_newsletter'] = 1;
        }
        else{
            obj['traits']['optin_jeffclub_newsletter'] = 0;
        }
        obj['traits']['date_optin_jeffclub_newsletter'] = currentLine[importColumnIndexMapping[10]];
      }  else if (index == 15) {
        obj['traits']['birthday'] = currentLine[j];
      }  else if (index == 16) {
        obj['traits']['preferred_store_code'] = currentLine[j];
      }
      obj['traits']['proximis_account_activated'] = 0;
      obj['traits']['origin'] = 'sedona';
    }

    jsonArr.push(obj);
  }
  finalJson['batch'] = jsonArr;
  jsonString = JSON.stringify(finalJson);
  return jsonString;
};
