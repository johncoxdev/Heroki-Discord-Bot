const { YELP_APIKEY } = require('../../botconfig.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');
let yelpAPI = require('yelp-api');

module.exports = {
    enabled: true,
    category: 'General',
    data: new SlashCommandBuilder()
        .setName("random_restaurant")
        .setDescription('Get a random restaurant from your zipcode or Houston in general')
        .addStringOption(opt => opt
            .setName("zip_code")
            .setDescription("[optional] - zipcode for local restaurant.")
            .setMinLength(1)
            .setMaxLength(7))
        .addStringOption(opt => opt
            .setName("category")
            .setDescription("[optional] - Type of category of food you want (Ex: Mexican, French, Deli, Steakhouse)")
            .setMinLength(1)
            .setMaxLength(30))
        .addIntegerOption(opt => opt
            .setName("price_amount_level")
            .setDescription("[optional] - the level of money you want to pay.")
            .setMinValue(1)
            .setMaxValue(4)),

    async execute(interaction) {
        let optionZipCode = interaction.options.getString("zip_code");
        let optionEthnicity = interaction.options.getString("category");
        let optionPriceAmount = interaction.options.getInteger("price_amount_level") 
        let searchParams = {limit: 50}


        if (optionZipCode === null || isNaN(optionZipCode) || optionZipCode.length !== 5 ) {
            if (optionZipCode === null) {
                optionZipCode = 'Houston, Tx';
            }else{
                return interaction.reply({ content:"Invalid zipcode!", ephemeral: true });    
            }
        }
        
        searchParams['location'] = optionZipCode

        if (optionPriceAmount != null){
             searchParams['price'] = optionPriceAmount
        }
        if (optionEthnicity != null){
            searchParams['categories'] = optionEthnicity
        } 
     
        let apiKey = YELP_APIKEY;
        let yelp = new yelpAPI(apiKey);

        let params = [searchParams];

        await yelp.query('businesses/search', params)
        .then(data => {
            const i = Math.floor(Math.random() * 20);
            const thing = JSON.parse(data[0]);
            const business = thing.businesses[i]
            const restaurant_name = (business.name) ? business.name : "N/A"
            const restaurant_link = (business.url) ? business.url : ""
            const restaurant_category = (business.categories[0].title) ? business.categories[0].title : "N/A"
            const restaurant_phone = (business.display_phone) ? business.display_phone : "N/A"
            const restaurant_image = (business.image_url) ? business.image_url : ""
            const restaurant_location = (business.location) ? `${business.location.address1}, ${business.location.city}, ${business.location.state}, ${business.location.zip_code}` : "N/A"
            const restaurant_price = (business.location) ? business.price : "N/A"
            const restaurant_rating = (business.rating) ? `${business.rating}/5` : "N/A"

            const successEmbed = new EmbedBuilder()
            .setTitle(restaurant_name)
            .setURL(restaurant_link)
            .setColor(Colors.DarkPurple)
            .setThumbnail(restaurant_image)
            .setDescription(`
            **Address:** ${restaurant_location}       
            **Category:** ${restaurant_category}
            **Phone:** ${restaurant_phone}
            **Price Range:** ${restaurant_price}
            **Rating:** ${restaurant_rating}

            **(Daily) - Global command uses left: ${data[1]}**
            `);
            interaction.reply({ content: `Random restaurant for ${optionZipCode}`, embeds: [successEmbed] });
        })
        .catch(err => {
            const errorEmbed = new EmbedBuilder()
            .setTitle("There was an error!")
            .setDescription("There was an error! \nPossible reasons:\n- Invalid zipcode \n- Invalid category \n- Maxed out wesbite response for the day")
            .setColor(Colors.Red);

            interaction.reply({ embeds: [errorEmbed] })
        });
    },
};