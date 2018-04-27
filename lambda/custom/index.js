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
			
			const speechText = randomRhyme + attributes.t('INDEXED_DECISION_MESSAGE', winnerIndex);

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
			
			const speechText = randomRhyme + attributes.t('NAMED_DECISION_MESSAGE', winner);

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
            NAMED_DECISION_MESSAGE: ' %s ist dran!',
            INDEXED_DECISION_MESSAGE: ' Spieler %s ist dran!',
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
    },
    'en': {
        translation: {
            RHYMES: rhymes.rhymesEN,
            NAMED_DECISION_MESSAGE: ' %s is it!',
            INDEXED_DECISION_MESSAGE: ' Player %s is it!',
            SKILL_NAME: 'Miny Moe',
            WELCOME_MESSAGE_SPEECH: 'Welcome to Miny Moe.',
            WELCOME_MESSAGE_READ: 'Welcome to Miny Moe.',
            HELP_MESSAGE: [
				'You can say: "Alexa, ask Miny Moe who wins."...what can I do for you?',
				'Try this: "Play with Arny and Sly."...what can I do for you?',
				'Try the following command: "Give me the winner among Daisy and Goofy."...what can I do for you?',
				'Say: "Give me a random number up to 42."...what can I do for you?',
				'Try this: "Decide whether Tom or Jerry is it."...what can I do for you?',
				'You may say: "Who\'s turn is it?"...what can I do for you?',
				'The following will work out as well... "Alexa, start Miny Moe and decide among Donald and Angela.?"...what can I do for you?',
				'You could say: "Alexa, ask Miny Moe for decision among 7 players."...what can I do for you?',
				'You can use the skill as follows: "Alexa, start Miny Moe and decide among Tarantino and Spielberg."...what can I do for you?',
				'Say: "Alexa, start Miny Moe and tell me the winner among Eny and Miny and Moe."...what can I do for you?',
				'Try: "Alexa, ask Miny Moe if Billy or Hilary does the dishes."...what can I do for you?',
				'You may say: "Alexa, ask Miny Moe if Mary or John is it." or "Tell me the winner among Eny and Miny and Moe."...what can I do for you?',
			],
            HELP_REPROMPT: [
				'Sorry, I didn\'t get it.',
				'Could you repeat please?',
				'Tell me what I can do you for.',
				'I did not hear anything.',
				'Do you need help?'
			],
            STOP_MESSAGE: 'Goodbye!',
            ERROR_MESSAGE: 'I am sorry. I am having technical problems.'
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
