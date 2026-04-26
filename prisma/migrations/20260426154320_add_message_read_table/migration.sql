-- CreateTable
CREATE TABLE "Read" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Read_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Read" ADD CONSTRAINT "Read_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Read" ADD CONSTRAINT "Read_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
