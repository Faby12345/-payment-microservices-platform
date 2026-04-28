package app.transferservice.service.interfaces;

import app.transferservice.dto.TransferRequest;
import app.transferservice.dto.TransferResponse;

public interface TransferService {
    TransferResponse initiateTransfer(TransferRequest request);
}
