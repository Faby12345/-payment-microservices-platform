CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY,
                                token VARCHAR(255) NOT NULL UNIQUE,
                                user_id UUID NOT NULL,
                                expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
                                revoked BOOLEAN NOT NULL DEFAULT FALSE,
                                created_at TIMESTAMP WITH TIME ZONE NOT NULL,


                                CONSTRAINT fk_user_refresh_token
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(id)
                                        ON DELETE CASCADE
);

-- Indexing for performance (search by token string often)
CREATE INDEX idx_refresh_token_string ON refresh_tokens(token);