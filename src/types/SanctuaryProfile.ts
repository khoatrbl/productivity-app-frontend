export interface LevelDto {
    level: number;
    threshold: number;
}

export interface ProfileDto {
    email: string;   
    displayName: string;
    timezone: string;
    currentLevel: LevelDto;
    currentExp: number;
    coins: number;
}