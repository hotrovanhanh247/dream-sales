-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "rank" TEXT,
    "parent_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_business_household" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_config" (
    "id" SERIAL NOT NULL,
    "tier" TEXT NOT NULL,
    "self_sale_pct" DECIMAL(5,4) NOT NULL,
    "direct_pct" DECIMAL(5,4) NOT NULL,
    "indirect2_pct" DECIMAL(5,4) NOT NULL,
    "indirect3_pct" DECIMAL(5,4) NOT NULL,
    "fixed_salary" DECIMAL(15,0) NOT NULL,

    CONSTRAINT "commission_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_commission_config" (
    "id" SERIAL NOT NULL,
    "group" TEXT NOT NULL,
    "commission_pct" DECIMAL(5,4) NOT NULL,
    "bonus_pct" DECIMAL(5,4) NOT NULL,

    CONSTRAINT "agency_commission_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "ctv_id" INTEGER,
    "total_spent" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "ctv_id" INTEGER,
    "channel" TEXT NOT NULL,
    "total_amount" DECIMAL(15,0) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_history" (
    "id" SERIAL NOT NULL,
    "ctv_id" INTEGER NOT NULL,
    "old_rank" TEXT NOT NULL,
    "new_rank" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL,
    "changed_by_id" INTEGER,

    CONSTRAINT "rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_fees" (
    "id" SERIAL NOT NULL,
    "from_user_id" INTEGER NOT NULL,
    "to_user_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "month" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breakaway_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "old_parent_id" INTEGER NOT NULL,
    "new_parent_id" INTEGER NOT NULL,
    "breakaway_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "breakaway_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breakaway_fees" (
    "id" SERIAL NOT NULL,
    "breakaway_log_id" INTEGER NOT NULL,
    "from_user_id" INTEGER NOT NULL,
    "to_user_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "month" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breakaway_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_logs" (
    "id" SERIAL NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "trainee_id" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_households" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "business_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_contracts" (
    "id" SERIAL NOT NULL,
    "contract_no" TEXT NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "trainee_id" INTEGER NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "terminated_at" TIMESTAMP(3),
    "termination_reason" TEXT,

    CONSTRAINT "b2b_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_parent_id_idx" ON "users"("parent_id");

-- CreateIndex
CREATE INDEX "users_rank_idx" ON "users"("rank");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "commission_config_tier_key" ON "commission_config"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "agency_commission_config_group_key" ON "agency_commission_config"("group");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_ctv_id_idx" ON "customers"("ctv_id");

-- CreateIndex
CREATE INDEX "transactions_ctv_id_idx" ON "transactions"("ctv_id");

-- CreateIndex
CREATE INDEX "transactions_channel_idx" ON "transactions"("channel");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_ctv_id_status_idx" ON "transactions"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "transactions_ctv_id_created_at_idx" ON "transactions"("ctv_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_channel_created_at_idx" ON "transactions"("channel", "created_at");

-- CreateIndex
CREATE INDEX "management_fees_to_user_id_month_idx" ON "management_fees"("to_user_id", "month");

-- CreateIndex
CREATE INDEX "management_fees_from_user_id_month_idx" ON "management_fees"("from_user_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "breakaway_logs_user_id_key" ON "breakaway_logs"("user_id");

-- CreateIndex
CREATE INDEX "breakaway_logs_status_expire_at_idx" ON "breakaway_logs"("status", "expire_at");

-- CreateIndex
CREATE INDEX "breakaway_logs_old_parent_id_idx" ON "breakaway_logs"("old_parent_id");

-- CreateIndex
CREATE INDEX "breakaway_logs_new_parent_id_idx" ON "breakaway_logs"("new_parent_id");

-- CreateIndex
CREATE INDEX "breakaway_logs_status_idx" ON "breakaway_logs"("status");

-- CreateIndex
CREATE INDEX "breakaway_fees_to_user_id_month_idx" ON "breakaway_fees"("to_user_id", "month");

-- CreateIndex
CREATE INDEX "breakaway_fees_breakaway_log_id_month_idx" ON "breakaway_fees"("breakaway_log_id", "month");

-- CreateIndex
CREATE INDEX "training_logs_trainer_id_idx" ON "training_logs"("trainer_id");

-- CreateIndex
CREATE INDEX "training_logs_trainee_id_idx" ON "training_logs"("trainee_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_households_user_id_key" ON "business_households"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_contracts_contract_no_key" ON "b2b_contracts"("contract_no");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_history" ADD CONSTRAINT "rank_history_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_fees" ADD CONSTRAINT "management_fees_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_fees" ADD CONSTRAINT "management_fees_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_logs" ADD CONSTRAINT "breakaway_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_logs" ADD CONSTRAINT "breakaway_logs_old_parent_id_fkey" FOREIGN KEY ("old_parent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_logs" ADD CONSTRAINT "breakaway_logs_new_parent_id_fkey" FOREIGN KEY ("new_parent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_fees" ADD CONSTRAINT "breakaway_fees_breakaway_log_id_fkey" FOREIGN KEY ("breakaway_log_id") REFERENCES "breakaway_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_fees" ADD CONSTRAINT "breakaway_fees_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breakaway_fees" ADD CONSTRAINT "breakaway_fees_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_households" ADD CONSTRAINT "business_households_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_contracts" ADD CONSTRAINT "b2b_contracts_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_contracts" ADD CONSTRAINT "b2b_contracts_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
