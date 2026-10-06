-- Keep the existing numeric keys and expose separate UUIDs through the audit API.
ALTER TABLE audit_logs ADD COLUMN public_id UUID NOT NULL DEFAULT uuid_generate_v4();
CREATE UNIQUE INDEX audit_logs_public_id_idx ON audit_logs(public_id);
ALTER TABLE audit_logs ADD COLUMN actor_public_id UUID;
UPDATE audit_logs a SET actor_public_id = u.public_id FROM users u WHERE a.actor_id = u.id;
CREATE INDEX audit_logs_actor_public_id_idx ON audit_logs(actor_public_id);
