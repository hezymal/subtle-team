package commands

import (
	"context"
	"strings"

	"subtle-team/internal/messages"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/vendors/bot_extensions"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func PokerHandler(pokerService *poker_service.PokerService) bot_extensions.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) error {
		pokerName := parsePokerMessageText(update.Message.Text)

		telegramChatId := update.Message.Chat.ID
		messageParams := messages.GetNewPokerMessageParams(telegramChatId, pokerName)
		sentMessage, err := b.SendMessage(ctx, &messageParams)
		if err != nil {
			return err
		}

		newPoker := poker_service.NewPokerDTO{
			Name:                  pokerName,
			TelegramChatId:        sentMessage.Chat.ID,
			TelegramMessageId:     sentMessage.ID,
			TelegramUserId:        sentMessage.From.ID,
			TelegramUserFirstName: sentMessage.From.FirstName,
			TelegramUserLastName:  sentMessage.From.LastName,
			TelegramUsername:      sentMessage.From.Username,
		}

		_, err = pokerService.CreatePoker(newPoker)
		if err != nil {
			return err
		}

		return nil
	}
}

func parsePokerMessageText(messageText string) string {
	_, pokerName, found := strings.Cut(messageText, " ")
	if !found {
		pokerName = ""
	} else {
		pokerName = strings.TrimSpace(pokerName)
	}

	return pokerName
}
