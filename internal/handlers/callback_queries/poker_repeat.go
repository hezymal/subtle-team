package callback_queries

import (
	"context"
	"fmt"
	"strings"

	"subtle-team/internal/messages"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/vendors/bot_extensions"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func PokerRepeatHandler(pokerService *poker_service.PokerService) bot_extensions.HandlerFunc {
	return func(ctx context.Context, b *bot.Bot, update *models.Update) error {
		_, err := b.AnswerCallbackQuery(ctx, &bot.AnswerCallbackQueryParams{
			CallbackQueryID: update.CallbackQuery.ID,
			ShowAlert:       false,
		})
		if err != nil {
			return err
		}

		telegramMessage := update.CallbackQuery.Message.Message
		telegramChatId := telegramMessage.Chat.ID
		telegramData := update.CallbackQuery.Data

		pokerId, err := parsePokerRepeatData(telegramData)
		if err != nil {
			return err
		}

		poker, err := pokerService.GetPokerById(pokerId)
		if err != nil {
			return err
		}

		messageParams := messages.GetNewPokerMessageParams(telegramChatId, poker.Name)
		sentMessage, err := b.SendMessage(ctx, &messageParams)
		if err != nil {
			return err
		}

		newPoker := poker_service.NewPokerDTO{
			Name:                  poker.Name,
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

func parsePokerRepeatData(data string) (string, error) {
	_, pokerId, found := strings.Cut(data, " ")
	if !found {
		return "", fmt.Errorf("Poker ID not found")
	}

	pokerId = strings.TrimSpace(pokerId)
	return pokerId, nil
}
