interface Mapping<T> {
    invoke(value: T, uniqueSelector: string): boolean;
}

class BasicMapping<T> implements Mapping<T> {
    private targetSelector: string;
    private valueMapper: (T) => string;

    constructor(targetSelector: string, mapper: (T) => string) {
        this.targetSelector = targetSelector;
        this.valueMapper = mapper;
    }

    public invoke(value: T, uniqueSelector: string) {
        let mappedValue = this.valueMapper(value);
        let targetElement = $(uniqueSelector + " " + this.targetSelector);
        if (targetElement != null) {
            targetElement.val(mappedValue);
            return true;
        } else {
            return false;
        }
    }
}

class ValidatedMapping<T> implements Mapping<T> {
    private targetSelector: string;
    private defaultValue: string;
    private valueValidator: (T) => boolean;
    private valueMapper: (T) => string;

    constructor(targetSelector: string, defaultValue: string, mapper: (T) => string, validator: (T) => boolean) {
        this.targetSelector = targetSelector;
        this.defaultValue = defaultValue;
        this.valueValidator = validator;
        this.valueMapper = mapper;
    }

    public invoke(value: T, uniqueSelector: string) {
        let targetElement = $(uniqueSelector + this.targetSelector);
        if (targetElement != null) {
            if (this.valueValidator(value)) {
                let mappedValue = this.valueMapper(value);
                targetElement.val(mappedValue);
            } else {
                targetElement.val(this.defaultValue);
            }
        }
        return false;
    }
}

class CustomMapper<T> implements Mapping<T> {
    private targetSelector: string;
    private mappingFunction: (value: T, targetSelector: string, uniqueSelector: string) => boolean;

    constructor(targetSelector: string, mappingFunction: (value: T, targetSelector: string, uniqueSelector: string) => boolean) {
        this.targetSelector = targetSelector;
        this.mappingFunction = mappingFunction;
    }

    public invoke(value: T, uniqueSelector: string) {
        return this.mappingFunction(value, this.targetSelector, uniqueSelector);
    }
}

class ObjectMapping implements Mapping<any> {
    private mapperToUse: Mapper;

    constructor(objectMapper: Mapper) {
        this.mapperToUse = objectMapper;
    }

    public invoke(value: any, uniqueSelector: string) {
        return this.mapperToUse.map(value, uniqueSelector);
    }
}