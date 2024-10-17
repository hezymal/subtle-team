package middlewares

import (
	"context"
	"log"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func AuditUserAction(next bot.HandlerFunc) bot.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) {
		if update.Message != nil {
			logMessageAction(update.Message)
		} else if update.CallbackQuery != nil {
			logCallbackQueryAction(update.CallbackQuery)
		} else {
			logUnknownAction()
		}

		next(ctx, b, update)

		if update.Message != nil {
			logMessageActionEnd(update.Message)
		} else if update.CallbackQuery != nil {
			logCallbackQueryActionEnd(update.CallbackQuery)
		} else {
			logUnknownActionEnd()
		}
	}
}

func logMessageAction(message *models.Message) {
	userId := message.From.ID
	actionText := shortUserActionText(message.Text)

	log.Printf("[update.message] user_id %d with text %s", userId, actionText)
}

func logMessageActionEnd(message *models.Message) {
	userId := message.From.ID
	actionText := shortUserActionText(message.Text)

	log.Printf("[update.message.end] user_id %d with text %s", userId, actionText)
}

func logCallbackQueryAction(callbackQuery *models.CallbackQuery) {
	message := callbackQuery.Message.Message
	userId := message.From.ID
	actionText := shortUserActionText(callbackQuery.Data)

	log.Printf("[update.callbackQuery] user_id %d with text %s", userId, actionText)
}

func logCallbackQueryActionEnd(callbackQuery *models.CallbackQuery) {
	message := callbackQuery.Message.Message
	userId := message.From.ID
	actionText := shortUserActionText(callbackQuery.Data)

	log.Printf("[update.callbackQuery.end] user_id %d with text %s", userId, actionText)
}

func logUnknownAction() {
	log.Printf("[unknown] unknown action")
}

func logUnknownActionEnd() {
	log.Printf("[unknown.end] unknown action")
}

func shortUserActionText(text string) string {
	const MAX_LENGTH = 32

	lastIndex := -1
	for index := 0; index < len(text); index++ {
		if text[index] == '\n' || index == MAX_LENGTH {
			break
		}

		lastIndex = index
	}

	return text[:lastIndex+1]
}
