package main

import (
	"context"
	"flag"
	"os"
	"os/signal"

	"github.com/go-telegram/bot"
	"github.com/ilyakaznacheev/cleanenv"

	"subtle-team/internal/handlers/callback_queries"
	"subtle-team/internal/handlers/commands"
	"subtle-team/internal/handlers/routes"
	"subtle-team/internal/middlewares"
	"subtle-team/internal/models/poker_dao"
	"subtle-team/internal/models/user_dao"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/services/user_service"
	"subtle-team/internal/vendors/bot_extensions"
	"subtle-team/internal/vendors/mongo_extensions"
)

type AppConfig struct {
	Mongo struct {
		ConnectionString string `yaml:"connectionString" env:"MONGO_CONNECTION_STRING"`
		DatabaseName     string `yaml:"databaseName" env:"MONGO_DATABASE_NAME"`
	} `yaml:"mongo"`

	Telegram struct {
		BotToken string `yaml:"botToken" env:"TELEGRAM_BOT_TOKEN"`
	} `yaml:"telegram"`
}

func main() {
	var configPath string
	flag.StringVar(&configPath, "config", "./config.yml", "path to configuration file")
	flag.Parse()

	var config AppConfig
	err := cleanenv.ReadConfig(configPath, &config)
	if err != nil {
		panic(err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	mongoFacade, err := mongo_extensions.NewMongoService(context.Background(), config.Mongo.ConnectionString, config.Mongo.DatabaseName)
	if err != nil {
		panic(err)
	}

	defer func() {
		err := mongoFacade.Close()
		if err != nil {
			panic(err)
		}
	}()

	userDAO := user_dao.NewUserDAO(mongoFacade)
	userService := user_service.NewUserService(userDAO)

	pokerDAO := poker_dao.NewPokerDAO(mongoFacade)
	pokerVoteDAO := poker_dao.NewPokerVoteDAO(mongoFacade)
	pokerService := poker_service.NewPokerService(pokerDAO, pokerVoteDAO, userService)

	b, err := bot.New(
		config.Telegram.BotToken,
		bot.WithMiddlewares(middlewares.AuditUserAction),
		bot_extensions.WithMessageTextHandler(
			routes.START_COMMAND_PREFIX,
			bot.MatchTypePrefix,
			commands.StartHandler(),
		),
		bot_extensions.WithMessageTextHandler(
			routes.POKER_COMMAND_PREFIX,
			bot.MatchTypePrefix,
			commands.PokerHandler(pokerService),
		),
		bot_extensions.WithCallbackQueryDataHandler(
			routes.POKER_VOTE_CALLBACK_QUERY_PREFIX,
			bot.MatchTypePrefix,
			callback_queries.PokerVoteHandler(pokerService),
		),
		bot_extensions.WithCallbackQueryDataHandler(
			routes.POKER_CLOSE_CALLBACK_QUERY_PREFIX,
			bot.MatchTypePrefix,
			callback_queries.PokerCloseHandler(pokerService),
		),
		bot_extensions.WithCallbackQueryDataHandler(
			routes.POKER_REPEAT_CALLBACK_QUERY_PREFIX,
			bot.MatchTypePrefix,
			callback_queries.PokerRepeatHandler(pokerService),
		),
	)
	if err != nil {
		panic(err)
	}

	b.Start(ctx)
}
