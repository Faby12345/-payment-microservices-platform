package app.walletservice.mapper;

import app.walletservice.dto.AccountResponse;
import app.walletservice.dto.WalletResponse;
import app.walletservice.entity.Account;
import app.walletservice.entity.Wallet;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class WalletMapper {

    public WalletResponse toResponse(Wallet wallet) {
        if (wallet == null) return null;

        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .status(wallet.getStatus().name())
                .accounts(wallet.getAccounts().stream()
                        .map(this::toAccountResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    public AccountResponse toAccountResponse(Account account) {
        if (account == null) return null;

        return AccountResponse.builder()
                .id(account.getId())
                .currency(account.getCurrency())
                .balance(account.getBalance())
                .availableBalance(account.getAvailableBalance())
                .build();
    }
}
