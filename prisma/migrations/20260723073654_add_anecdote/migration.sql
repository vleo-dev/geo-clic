-- CreateTable
CREATE TABLE "Anecdote" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Anecdote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Anecdote_country_idx" ON "Anecdote"("country");
