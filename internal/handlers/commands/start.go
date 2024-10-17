package commands

import (
	"context"

	"subtle-team/internal/messages"
	"subtle-team/internal/vendors/bot_extensions"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func StartHandler() bot_extensions.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) error {
		telegramChatId := update.Message.Chat.ID
		messageParams := messages.GetStartCommandMessageParams(telegramChatId)
		_, err := b.SendMessage(ctx, &messageParams)
		if err != nil {
			return err
		}

		return nil
	}
}
