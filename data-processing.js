module.exports = function(csvArray) {
  var headers = csvArray[0][0];
  headers = headers.replace(/\s+/g, '_');
  headers = headers.split(';');

  var finalJson = {};
  var jsonArr = [];
  var jsonString;

  var dataMappingKey = [
    'Code_client_ou_identifiant_client', // 0
    'Centre_de_cout', // 1
    'Prénom', // 2
    'Nom', // 3
    'Titre', // 5
    'Code_Postal', // 9
    'Pays',
    'Téléphone',
    'E-mail',
    'Date_de_création_compte_VEL',
    'Date_de_création_compte_jeff_club',
    'Date_de_dernière_connexion_VEL',
    'Date_de_dernière_connexion_jeff_club',
    'inscription_newsletter_VEL',
    'inscription_newsletter_jeff_club',
    'Date_de_naissance',
    'Code_client_du_magasin_préféré_pour_les_clients_Jeff_club'
  ];

  var importColumnIndexMapping = [];
  for (var i = 0; i < dataMappingKey.length; i++) {
    var index = headers.indexOf(dataMappingKey[i]);
    importColumnIndexMapping.push(index);
  }

  for (var i = 1; i < csvArray.length; i++) {
    var obj = {};
    var currentLine = csvArray[i][0].split(';');
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
        obj['userId'] = 'S' + currentLine[j];
      } else if (index == 1) {
        if (currentLine[j].indexOf('JC') > -1) {
          obj['traits']['jeffclub'] = 1;
        } else {
          obj['traits']['jeffclub'] = 0;
        }
        if (currentLine[j].indexOf('VEL') > -1) {
          obj['traits']['vel_customer'] = 1;
        }
      } else if (index == 2) {
        obj['traits']['first_name'] = currentLine[j];
      } else if (index == 3) {
        obj['traits']['last_name'] = currentLine[j];
      } else if (index == 4) {
        if (currentLine[j] == 'mr') {
          obj['traits']['gender'] = 'm';
        } else if (currentLine[j] == 'mm' || currentLine[j] == 'ms') {
          obj['traits']['gender'] = 'mme';
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
        // obj["traits"]["last_connexion_vel"] = currentLine[j];
      } else if (index == 12) {
        // obj["traits"]["last_connexion_jeffclub"] = currentLine[j];
      } else if (index == 13) {
        obj['traits']['optin_web_newsletter'] = currentLine[j];
        obj['traits']['date_optin_web_newsletter'] =
          currentLine[importColumnIndexMapping[9]];
      } else if (index == 14) {
        obj['traits']['optin_jeffclub_newsletter'] = currentLine[j];
        obj['traits']['date_optin_jeffclub_newsletter'] =
          currentLine[importColumnIndexMapping[10]];
      } else if (index == 15) {
        obj['traits']['birthday'] = currentLine[j];
      } else if (index == 16) {
        obj['traits']['prefered_store_code'] = currentLine[j];
      }
      obj['traits']['proximis_account_activated'] = 0;
    }
    jsonArr.push(obj);
  }
  finalJson['batch'] = jsonArr;
  jsonString = JSON.stringify(finalJson, null, 2);

  return jsonString;
};
