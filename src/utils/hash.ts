import bcrypt from 'bcrypt';

export const GenerateHash = async (
    plain: string
):Promise<string> => await bcrypt.hash(plain, 10);


export const CompareHash = async (
    plain: string,
    hash: string
):Promise<boolean> => await bcrypt.compare(plain, hash);