package com.donutprofit.verification;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.UUID;

public final class DonutProfitVerificationPlugin extends JavaPlugin implements Listener, CommandExecutor {
    private static final String RECEIVER_NAME = "cartisneakz";
    private static final double REQUIRED_AMOUNT = 430.0;
    private static final long PAYMENT_WINDOW_MS = 1000L * 60 * 60 * 12; // 12 hours

    private File paymentLogFile;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        reloadConfig();

        FileConfiguration config = getConfig();
        if (!config.contains("receiverName")) {
            config.set("receiverName", RECEIVER_NAME);
            config.set("requiredAmount", REQUIRED_AMOUNT);
            config.set("paymentWindowHours", 12);
            saveConfig();
        }

        paymentLogFile = new File(getDataFolder(), "payments.log");
        if (!paymentLogFile.exists()) {
            try {
                paymentLogFile.createNewFile();
            } catch (IOException e) {
                getLogger().warning("Failed to create payment log file: " + e.getMessage());
            }
        }

        getServer().getPluginManager().registerEvents(this, this);
        getCommand("verifydonut").setExecutor(this);
        getCommand("donutverifyreload").setExecutor(this);

        getLogger().info("DonutProfitVerification enabled.");
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        if (!player.hasPermission("donutprofit.verify")) {
            return;
        }

        if (hasRecentValidPayment(player.getName())) {
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "lp user " + player.getName() + " permission set donutprofit.website true");
            player.sendMessage("§aDonutSMP verification detected. Your website access is active.");
        }
    }

    private boolean hasRecentValidPayment(String ign) {
        String logContent;
        try {
            logContent = Files.readString(paymentLogFile.toPath(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return false;
        }

        String[] lines = logContent.split("\\R");
        long now = System.currentTimeMillis();

        for (String line : lines) {
            if (line == null || line.isBlank()) continue;
            String[] parts = line.split("\\|\|");
            if (parts.length < 5) continue;

            try {
                String payer = parts[0].trim();
                String receiver = parts[1].trim();
                double amount = Double.parseDouble(parts[2].trim());
                long time = Long.parseLong(parts[3].trim());

                if (!payer.equalsIgnoreCase(ign)) continue;
                if (!receiver.equalsIgnoreCase(RECEIVER_NAME)) continue;
                if (Math.abs(amount - REQUIRED_AMOUNT) > 0.001) continue;
                if (now - time > PAYMENT_WINDOW_MS) continue;

                return true;
            } catch (NumberFormatException ignored) {
                // ignore malformed rows
            }
        }

        return false;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("donutverifyreload")) {
            reloadConfig();
            sender.sendMessage("§aDonutProfitVerification config reloaded.");
            return true;
        }

        if (command.getName().equalsIgnoreCase("verifydonut")) {
            if (args.length < 2) {
                sender.sendMessage("§cUsage: /verifydonut <player> <amount>");
                return true;
            }

            String targetName = args[0];
            double amount;
            try {
                amount = Double.parseDouble(args[1]);
            } catch (NumberFormatException e) {
                sender.sendMessage("§cAmount must be a number.");
                return true;
            }

            boolean found = hasRecentValidPayment(targetName);
            if (Math.abs(amount - REQUIRED_AMOUNT) <= 0.001 && found) {
                sender.sendMessage("§aPayment verified for " + targetName + ".");
                Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "lp user " + targetName + " permission set donutprofit.website true");
                return true;
            }

            sender.sendMessage("§cNo matching recent payment found for " + targetName + ".");
            return true;
        }

        return false;
    }

    public static void logPayment(String payer, String receiver, double amount) {
        // Called by a custom economy hook or pay listener if you plug it into your server.
        String timestamp = String.valueOf(System.currentTimeMillis());
        String line = payer + "||" + receiver + "||" + amount + "||" + timestamp + "||" + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(new Date()) + System.lineSeparator();

        try {
            File paymentLogFile = new File("plugins/DonutProfitVerification/payments.log");
            File parentDir = paymentLogFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(paymentLogFile, true))) {
                writer.write(line);
            }
        } catch (IOException ignored) {
        }
    }
}
