package com.itjob.entities.Enums;

public enum Role {

    ADMIN("Admin"), RECRUITER("Recuriter"), CANDIDATE("Candidate");

    private final String displayName;

    Role(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
