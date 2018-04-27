'use strict';
const Alexa = require('ask-sdk-core');
const rhymes = require('./rhymes');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const appId = 'amzn1.ask.skill.0cc303e8-e9e5-4218-b325-90ffa00327fc';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        const welcomeTextSpeech = attributes.t('WELCOME_MESSAGE_SPEECH');
        const welcomeTextRead = attributes.t('WELCOME_MESSAGE_READ');
		const welcomHelpText = getRandomElement(attributes.t('HELP_MESSAGE'));
		const repromtHelpText = getRandomElement(attributes.t('HELP_MESSAGE'));
		const repromtText = getRandomElement(attributes.t('HELP_REPROMPT'));
		
        const speechText = welcomeTextSpeech + ' ' + welcomHelpText;
        const readText = welcomeTextRead + ' ' + welcomHelpText;
		const reprompt = repromtText + ' ' + repromtHelpText;
		
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(reprompt)
            .withSimpleCard(attributes.t('SKILL_NAME'), readText)
            .getResponse();
    }
};

const StartWithUnknownPlayersIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartWithUnknownPlayersIntent';
    },
    handle(handlerInput) {
		if (!handlerInput.requestEnvelope.request.intent.slots.count.value){
			return handlerInput.responseBuilder
				.addDelegateDirective()
				.getResponse();
		} else {
			const attributes = handlerInput.attributesManager.getRequestAttributes();
			const count = handlerInput.requestEnvelope.request.intent.slots.count.value;
			const winnerIndex = getWinnerIndex(count);
			
			const RhymeTypesArr = attributes.t('RHYMES');
			const randomRhymesArr = getRandomElement(RhymeTypesArr);
			const randomRhyme = getRandomElement(randomRhymesArr);
			
			const speechText = randomRhyme + ` Spieler ${winnerIndex} ist dran!`;

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard(attributes.t('SKILL_NAME'), speechText)
				.getResponse();
		}
    }
};

const StartWithNamedPlayersIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartWithNamedPlayersIntent';
    },
    handle(handlerInput) {
		if (!handlerInput.requestEnvelope.request.intent.slots.names.value){
			return handlerInput.responseBuilder
				.addDelegateDirective()
				.getResponse();
		}  else {
			const attributes = handlerInput.attributesManager.getRequestAttributes();
			const names = handlerInput.requestEnvelope.request.intent.slots.names.value;
			const winner = getWinnerName(names);
			
			const RhymeTypesArr = attributes.t('RHYMES');
			const randomRhymesArr = getRandomElement(RhymeTypesArr);
			const randomRhyme = getRandomElement(randomRhymesArr);
			
			const speechText = randomRhyme + ` ${winner} ist dran!`;

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard(attributes.t('SKILL_NAME'), speechText)
				.getResponse();
		}
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
		const attributes = handlerInput.attributesManager.getRequestAttributes();
        const speechText = getRandomElement(attributes.t('HELP_MESSAGE'));
        const reprompt = getRandomElement(attributes.t('HELP_REPROMPT'));

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(reprompt + ' ' + speechText)
            .withSimpleCard(attributes.t('SKILL_NAME'), speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
		const attributes = handlerInput.attributesManager.getRequestAttributes();
        const speechText = attributes.t('STOP_MESSAGE');

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
	const attributes = handlerInput.attributesManager.getRequestAttributes();
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak(attributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

exports.handler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         StartWithUnknownPlayersIntentHandler,
						 StartWithNamedPlayersIntentHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .addErrorHandlers(ErrorHandler)
     .addRequestInterceptors(LocalizationInterceptor)
     .withSkillId(appId)
     .lambda();
     
const languageStrings = {
    'de': {
        translation: {
            RHYMES: rhymes.rhymesDE,
            SKILL_NAME: 'Ene Mene Muh',
            WELCOME_MESSAGE_SPEECH: 'Willkommen bei <phoneme alphabet="ipa" ph="eːne">Ene</phoneme> <phoneme alphabet="ipa" ph="meːne">Mene</phoneme> Muh.',
            WELCOME_MESSAGE_READ: 'Willkommen bei Ene Mene Muh.',
            HELP_MESSAGE: [
				'Du kannst sagen, "Spiele mit Pia und Stefan" oder "Spiele mit fünf Spielern"... was kann ich für dich tun?',
				'Teste folgendes: "Wer ist dran?" oder "Wer gewinnt?"... was kann ich für dich tun?',
				'Probiere folgenden Befehl, "Ist Daniel oder Sara dran?" oder "Entscheide ob Gabriel oder Michael den Müll runter bringt!"... was kann ich für dich tun?',
				'Sage: "Starte Ene Mene Muh und Füge Uschi und Purzel hinzu" oder "Entscheide ob Franz oder Horst dran ist"... was kann ich für dich tun?',
				'Probiere doch mal: "Spiele mit Angela und Tom und Gabi"... was kann ich für dich tun?',
				'Du kannst sagen: "Entscheide zwischen drei Spielern" oder "Spiele mit drei Spielern"... was kann ich für dich tun?',
				'Es funktioniert auch... "Welche Zahl gewinnt?" oder "Welcher Spieler beginnt?"... was kann ich für dich tun?',
				'Du kannst folgendes sagen: "Entscheide zwischen Thomas und Gisela"... was kann ich für dich tun?',
				'Du kannst den Skill auch folgendermaßen nutzen: "Starte Ene Mene Muh mit den Kandidaten Tini und Marian!"... was kann ich für dich tun?',
				'Sage: "Entscheidung zwischen Spielberg und Tarantino"... was kann ich für dich tun?',
				'Probiere: "Showdown zwischen Donald und Angela"... was kann ich für dich tun?',
				'Du kannst sagen: "Gib mir eine Zufallszahl bis Sieben" oder "Gib mir den Gewinner aus fünf Spielern"... was kann ich für dich tun?',
			],
            HELP_REPROMPT: [
				'Ich habe dich leider nicht verstanden.',
				'Ich habe wohl Tomaten auf den Ohren, kannst du das bitte wiederholen?',
				'Bitte sage mir, was ich für dich tun soll.',
				'Leider habe ich nichts gehört.',
				'Benötigst du meine Hilfe?'
			],
            STOP_MESSAGE: 'Auf Wiedersehen!',
            ERROR_MESSAGE: 'Es tut mir leid. Ich habe im Moment technische Probleme.'
        },
    }
};

/*helpers*/
function capitalizeFirstLetter(item) {
    return item.charAt(0).toUpperCase() + item.slice(1);
}

function getRandomNumber(count){
	return Math.floor(Math.random() * count);
}

function getRandomElement(myData) {
	var elementIndex = getRandomNumber(myData.length);
	return(myData[elementIndex]);
}

function getWinnerName(names) {
	var namesArr = names.split(' ');
	return capitalizeFirstLetter(getRandomElement(namesArr));
}

function getWinnerIndex(count) {
    var randomIndex = getRandomNumber(count) + 1;
	return capitalizeFirstLetter(randomIndex.toString());
}
